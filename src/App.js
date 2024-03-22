import Header from './Header.js'
import  { useState, useEffect, useRef } from 'react';
import *  as d3 from 'd3'
import { apiKey } from './constants.js'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
const margins = {left: 50, top: 50, right: 50, bottom: 50}

const getVals = (row, stat) => {
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

const initVals = { 'OPS': [], 'BA': [],  'SB': [],'BB': [], 'K': [] }
function App() {
	const [token, setToken] = useState(null)
	const [prevToken, setPrevToken] = useState(null)
	const [aggData, setAggData]  = useState([])
	const svgRef = useRef(null)

	const [svgWidth, setSVGWidth] = useState(document?.body?.offsetWidth/2 || 500)
	const [svgHeight, setSVGHeight] = useState(document?.body?.offsetWidth/2 || 500)
	const [sortedVals, setSortedVals] = useState(initVals)
	// Initialize players with Acuna
	const [selectedPlayers, setSelectedPlayers] = useState([660670])
	// Get token
	const getToken = async () => {
    const resp = await fetch('https://project.trumedianetworks.com/api/token', {
			method: 'GET',
			accept: 'application/json',
			headers: {
				apiKey: apiKey
			}
		});
    const tokenResp = await resp.json();
    setToken(tokenResp.token);
  }

	// Use token to get season stats
	const getAggData = async (tempToken: string) => {
		const resp = await fetch('https://project.trumedianetworks.com/api/mlb/dataviz-data-aggregate', {
			method: 'GET',
			accept: 'application/json',
			headers: {
				tempToken: token
			}
		});
    const data = await resp.json();
		// Map sorted values for each of 5 key metrics
		let tempVals = initVals
		Object.keys(sortedVals).forEach((d) => {
			const vals = data.map((a) => {
				return getVals(a, d)
			}).sort((a, b) => d3.ascending(a, b))
			tempVals = {...tempVals, [d]: vals}
		})

		// Save values in state
		setSortedVals(tempVals)
    setAggData(data);
  }

	// Prevent re-renders
	if(!token){
		getToken()
	}
	if(token && !prevToken){
		setPrevToken(token)
		getAggData()
	}

	console.log(aggData)
	// Redraw plot on window resize
	useEffect(() => {
		if(document?.body){
			setSVGWidth(document.body.offsetWidth/2)
			setSVGHeight(document.body.offsetWidth/2)
		}

		function handleResize(this: Window){
			if(document?.body){
				setSVGWidth(document.body.offsetWidth/2)
				setSVGHeight(document.body.offsetWidth/2)
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

		selectedPlayers.forEach((d, j) => {
			const playerData = aggData.find((a) => a.playerId === d)
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
			   .attr("fill", colorScheme[j])
				 .attr('opacity', .4)
			   .style("stroke", "black")

				svg.selectAll('playerPts')
				.data(playerCoords)
				.enter()
				.append('circle')
				.attr('cx', (p) => p.x)
				.attr('cy', (p) => p.y)
				.attr('r', 3)
				.attr('fill', colorScheme[j])
				.attr('stroke', 'black')
			}
		})

	}, [aggData, svgWidth, svgHeight, selectedPlayers])


  return (
		<>
			<Header title="Offensive Player Comps"/>

			<Grid container sx={{marginTop: '90px'}}>
			<Grid item xs={12}>
					<Autocomplete
						multiple
						onChange={(e, v) => {
							setSelectedPlayers(v.map((d) => d.id))
						}}
						value={selectedPlayers.map((d) => {
							const player = aggData.find((a) => a.playerId === d )
							return {label: player?.abbrevName, id: player?.playerId}
						})}
						options={aggData?.map((d) => ({label: d.abbrevName, id: d.playerId}))}
						getOptionLabel={(option) => option.label}
						renderInput={(params) => <TextField {...params} label="Select Players" />}
					/>
				</Grid>
				<Grid item xs={6}>
		     	<svg ref={svgRef}> </svg>
				</Grid>
			 </Grid>
		</>
  );
}

export default App;
