import Header from './Header.js'
import SearchAutocomplete from './SearchAutocomplete.js'
import RadarPlot, {getVals} from './RadarPlot.js'
import Grid from '@mui/material/Grid'
import React, { useState } from 'react';
import *  as d3 from 'd3'
import { apiKey, initVals } from './constants.js'

function App() {
	// Store token
	const [token, setToken] = useState(null)

	// Store previous token to prevent re-renders
	const [prevToken, setPrevToken] = useState(null)

	// Store season data from API
	const [aggData, setAggData]  = useState([])

	// Store sorted values to calculate percentiles
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
					<SearchAutocomplete selectedPlayers={selectedPlayers} setSelectedPlayers={setSelectedPlayers} aggData={aggData}/>
				</Grid>
				{selectedPlayers.map((d, j) =>
					<Grid key={d.playerId} item xs={12} sm={4}>
						<RadarPlot sortedVals={sortedVals} aggData={aggData} playerId={d} index={j}/>
					</Grid>
				)}
			 </Grid>
		</>
  );
}

export default App;
