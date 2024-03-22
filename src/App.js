import Header from './Header.js'
import RadarPlot, {getVals} from './RadarPlot.js'
import React, { useState, useEffect, useRef } from 'react';
import *  as d3 from 'd3'
import { apiKey, initVals } from './constants.js'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

function App() {
	const [token, setToken] = useState(null)
	const [prevToken, setPrevToken] = useState(null)
	const [aggData, setAggData]  = useState([])


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
						isOptionEqualToValue={(a, b) => a.id === b.id}
					/>
				</Grid>
				{selectedPlayers.map((d, j) => <Grid key={d.playerId} item xs={6}> <RadarPlot sortedVals={sortedVals} aggData={aggData} playerId={d} index={j}/> </Grid>)}
			 </Grid>
		</>
  );
}

export default App;
