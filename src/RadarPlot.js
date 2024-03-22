import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3'
import { initVals } from './constants.js'

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

const margins = {left: 50, top: 50, right: 50, bottom: 50}


function RadarPlot({sortedVals, aggData, playerId, index}) {
	const svgRef = useRef(null)
	const [svgWidth, setSVGWidth] = useState(document?.body?.offsetWidth/(document?.body?.offsetWidth < 600 ? 1 : 3 )|| 300)
	const [svgHeight, setSVGHeight] = useState(document?.body?.offsetWidth/(document?.body?.offsetWidth < 600 ? 1 : 3 ) || 300)

	// Redraw plot on window resize
	useEffect(() => {
		if(document?.body){
			setSVGWidth(document.body.offsetWidth/(document?.body?.offsetWidth < 600 ? 1 : 3 ))
			setSVGHeight(document.body.offsetWidth/(document?.body?.offsetWidth < 600 ? 1 : 3 ))
		}

		function handleResize(this: Window){
			if(document?.body){
				setSVGWidth(document.body.offsetWidth/(document?.body?.offsetWidth < 600 ? 1 : 3 ))
				setSVGHeight(document.body.offsetWidth/(document?.body?.offsetWidth < 600 ? 1 : 3 ))
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)

	}, [svgRef.current])

	// Do not redraw plot on every render
	useEffect(() => {
		d3.select(svgRef.current).selectAll('*').remove()
		const height = svgHeight - margins.top - margins.bottom
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
					return xScale(Math.cos(rad)*55)
			})
			.attr('y', (p, i) => {
					const rad = ((i*360/5)-90)*(Math.PI/180)
						return xScale(Math.sin(rad)*55)
			})
			.attr('font-size', '14px')
			.attr('font-weight', 'medium')
			.style('font-family', 'Trebuchet MS')
			.style('text-anchor', 'middle')
			.style('alignment-baseline', 'middle')

			const playerData = aggData.find((a) => a.playerId === playerId)
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
			   .style("stroke", "black")

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

	}, [aggData, svgWidth, svgHeight, playerId])

  return (
		<svg ref={svgRef}> </svg>
  );
}

export default RadarPlot;
