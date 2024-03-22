import Header from './Header.js'
import  { useState, useEffect, useRef } from 'react';
import *  as d3 from 'd3'
import { apiKey } from './constants.js'
import Box from '@mui/material/Box'
const margins = {left: 5, top: 5, right: 5, bottom: 5}

function App() {
	const [token, setToken] = useState(null)
	const [prevToken, setPrevToken] = useState(null)
	const [aggData, setAggData]  = useState([])
	const [svgWidth, setSVGWidth] = useState(500)
	const [svgHeight, setSVGHeight] = useState(500)

	const svgRef = useRef(null)
	const parentElement = svgRef.current?.parentElement
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

	const getAggData = async (tempToken: string) => {
		const resp = await fetch('https://project.trumedianetworks.com/api/mlb/dataviz-data-aggregate', {
			method: 'GET',
			accept: 'application/json',
			headers: {
				tempToken: token
			}
		});
    const data = await resp.json();
    setAggData(data);
  }

	if(!token){
		getToken()
	}

	if(token && !prevToken){
		setPrevToken(token)
		getAggData()
	}


	useEffect(() => {
		if(parentElement){
			setSVGWidth(d3.min([parentElement.clientWidth, 500]))
			setSVGHeight(d3.min([parentElement.clientWidth, 500]))
		}

		function handleResize(this: Window){
			if(parentElement){
				setSVGWidth(d3.min([parentElement.clientWidth, 500]))
				setSVGHeight(d3.min([parentElement.clientWidth, 500]))
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)

	}, [parentElement])
	console.log(svgHeight)
	useEffect(() => {
		d3.select(svgRef.current).selectAll('*').remove()
		const height = svgHeight - margins.top - margins.bottom
		const width = svgWidth - margins.left - margins.right

		const svg = d3.select(svgRef.current)
		.attr('width', svgWidth)
		.attr('height', svgHeight)
		.append('g')
		.attr('transform', `translate(${margins.left},${margins.top})`)

		const yScale = d3.scaleLinear().domain([0,100]).range([height, 0])
		const xScale = d3.scaleLinear().domain([0,100]).range([0, width])

	svg.append('circle')
		.attr('cx', xScale(50))
		.attr('cy', yScale(50))
		.attr('r', 10)
		.attr('fill', 'cyan')
		.attr('stroke', 'black')

	}, [aggData, svgWidth, svgHeight])


  return (
		<>
			<Header title="Player Comps"/>
			<Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 4, width: '50%', marginTop: '90px'}}>
	     	<svg ref={svgRef}> </svg>
			 </Box>
		</>
  );
}

export default App;
