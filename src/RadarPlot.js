import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3'
import { initVals } from './constants.js'
import {Box, Badge, Avatar} from '@mui/material'
export const getVals = (row, stat) => {
	if(stat === 'OPS' && row){
		return Number(row.SLG) + Number(row.OBP)
	}
	if((stat === 'BA' || stat === 'OBP' || stat === 'SB') && row){
		return Number(row[stat])
	}
	if((stat === 'K' || stat === 'BB') && row){
		return Number(row[stat])/Number(row.PA)
	}
}
const colorScheme = d3.schemeTableau10


const colorScale = d3.scaleLinear().domain([-100, 50, 200]).range(['blue', 'white', 'red'])

function RadarPlot({sortedVals, aggData, playerId, index}) {
	const svgRef = useRef(null)
	const [svgWidth, setSVGWidth] = useState(document?.body?.offsetWidth/(document?.body?.offsetWidth < 584 ? 1 : 3 )|| 300)
	const [svgHeight, setSVGHeight] = useState(document?.body?.offsetWidth/(document?.body?.offsetWidth < 584 ? 1 : 3 ) || 300)

	const abbreviate = svgWidth < 400

	const margins = {left: 40, top: abbreviate ? 25 : 40, right: 40, bottom: 40}


	const playerData = aggData.find((a) => a.playerId === playerId)

	// Redraw plot on window resize
	useEffect(() => {
		if(document?.body){
			setSVGWidth(document.body.offsetWidth/(document?.body?.offsetWidth < 584 ? 1 : 3 ))
			setSVGHeight(document.body.offsetWidth/(document?.body?.offsetWidth < 584 ? 1 : 3 ))
		}

		function handleResize(this: Window){
			if(document?.body){
				setSVGWidth(document.body.offsetWidth/(document?.body?.offsetWidth < 584 ? 1 : 3 ))
				setSVGHeight(document.body.offsetWidth/(document?.body?.offsetWidth < 584 ? 1 : 3 ))
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)

	}, [])

	// Do not redraw plot on every render
	useEffect(() => {
		d3.select(svgRef.current).selectAll('*').remove()
		const width = svgWidth - margins.left - margins.right

		const svg = d3.select(svgRef.current)
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.append('g')
		.attr('transform', `translate(${margins.left},${margins.top})`)

		const rScale = d3.scaleLinear().domain([0,100]).range([0, width/2])
		const xScale = d3.scaleLinear().domain([-50,50]).range([0, width])

	svg.selectAll('circles').data([20,40,60,80,100])
		.enter()
		.append('circle')
		.attr('cx', xScale(0))
		.attr('cy', xScale(0))
		.attr('r', (d) => rScale(d))
		.attr('fill', 'none')
		.attr('stroke', 'rgba(0,0,0,.2)')

		svg.selectAll('labels')
			.data(Object.keys(initVals))
			.enter()
			.append('text')
			.text((p) => p)
			.attr('x', (p, i) => {
					const rad = ((i*360/5)-90)*(Math.PI/180)
					return xScale(Math.cos(rad)*(55))
			})
			.attr('y', (p, i) => {
					const rad = ((i*360/5)-90)*(Math.PI/180)
					return xScale(Math.sin(rad)*(55))
			})
			.attr('font-size', svgWidth < 300 ? '12px' : '16px')
			.attr('font-weight', 'medium')
			.style('font-family', 'Trebuchet MS')
			.style('text-anchor', 'middle')
			.style('alignment-baseline', 'middle')

			console.log(playerData)
			svg.selectAll('iles')
				.data( svgWidth < 400 ? [20,60, 100] : [20,40,60,80,100])
				.enter()
				.append('text')
				.text((p) => p === 100 ?`${p}%-ile` : p)
				.attr('x', (p) => {
						return xScale(p/2)
				})
				.attr('y', width/2)
				.attr('font-size', '10px')
				.style('font-family', 'Trebuchet MS')
				.style('text-anchor', 'staft')
				.style('alignment-baseline', 'middle')
				.style('fill', 'gray')

			if(playerData){
				const playerCoords = []
				Object.keys(initVals).forEach((v, i) => {
							const playerVal = getVals(playerData, v)
							let perc = sortedVals[v].filter((s) => s <= playerVal).length/aggData.length
							perc = v === 'K' ? 1-perc : perc
							const rad = ((i*360/5)-90)*(Math.PI/180)
							playerCoords.push({x: xScale(Math.cos(rad)*perc/2*100), y: xScale(Math.sin(rad)*perc/2*100)})
				})

				svg.append("polygon")
			   .attr("points", playerCoords.map((p) => [p.x, p.y].join(',')))
			   .attr("fill", colorScheme[index])
				 .attr('opacity', .4)
			   .style("stroke", 'black')
				 .attr('stroke-width', '2px')


				svg.selectAll('playerPts')
				.data(playerCoords)
				.enter()
				.append('circle')
				.attr('cx', (p) => p.x)
				.attr('cy', (p) => p.y)
				.attr('r', 3)
				.attr('fill', colorScheme[index])
				.attr('stroke', 'black')
			}

	}, [aggData, svgWidth, svgHeight, playerId, index, sortedVals, playerData, margins.left, margins.top, margins.right])


  return (
		<Box sx={{fontFamily: 'Trebuchet MS'}}>

			<Box sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center',  paddingTop: 1, paddingLeft: 3, gap: 1}}>
			{playerData && (
				<>
					<Badge
						overlap="circular"
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						badgeContent={
							<Avatar sx={{width: abbreviate ? '0px' : '15px', height: abbreviate ? '0px' : '15px'}} src={playerData.teamImage} />
						}
					>
						<Avatar sx={{width: abbreviate ? '22px' : '42px', height: abbreviate ? '22px' : '42px', border: '1px solid gray', backgroundColor: 'white'}}src={playerData.playerImage} />
					</Badge>
					<Box sx={{ fontSize: abbreviate ? '12px' : '20px'}}> {playerData.abbrevName} </Box>
				</>
			)}
			</Box>
			<svg ref={svgRef}> </svg>
			<table style={{fontSize: abbreviate ? '12px' : '14px', width: '80%', marginLeft: '10%', tableLayout: 'fixed', marginBottom: '20px', border: '1px solid black', borderCollapse: 'collapse'}}>
				<tr style={{borderBottom: '.5px solid black'}}>
					{['K%', 'BB%', 'OPS', 'SB', 'BA'].map((d) => {
							return <th style={{paddingX: '4px'}}> {d} </th>
					})}
				</tr>
				<tr>
					{['K', 'BB', 'OPS', 'SB', 'BA'].map((d) => {
						if(playerData){
							const val = getVals(playerData, d)
							let formattedVal = d3.format(['K', 'BB'].includes(d) ? '.1%' : d === 'SB' ? '' : '.3f')(val)
							if(d === 'OPS' || d === 'BA'){
								formattedVal = formattedVal.replace('0.', '.')
							}
							console.log(sortedVals)
							let ile = (sortedVals[d].filter((s) => s <= val).length/aggData.length)
							if(d === 'K'){
								ile = 1 - ile
							}
							console.log(d, playerData.abbrevName, ile)
							return <td style={{textAlign: 'center', paddingX: '4px', backgroundColor: colorScale(ile*100)}}> {formattedVal} </td>
						}
						return <td> -- </td>

					})}
				</tr>
			</table>
		 </Box>
  );
}

export default RadarPlot;
