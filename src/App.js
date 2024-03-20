import Header from './Header.js'
import  { useState, useEffect } from 'react';
import { apiKey } from './constants.js'


function App() {
	const [title] = useState('TruMedia Data Viz Project')
	const [token, setToken] = useState(null)
	const [prevToken, setPrevToken] = useState(null)
	const [gameLogs, setGameLogs] = useState([])
	const [aggData, setAggData]  = useState([])
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


	const getBoxScoreData = async (tempToken: string) => {
		const resp = await fetch('https://project.trumedianetworks.com/api/mlb/dataviz-data-by-game/1000', {
			method: 'GET',
			accept: 'application/json',
			headers: {
				tempToken: token
			}
		});
    const data = await resp.json();
    setGameLogs(data);
  }

	if(!token){
		getToken()
	}
	console.log(token)
	if(token && !prevToken){
		setPrevToken(token)
		getAggData()
		getBoxScoreData()
	}

	console.log(gameLogs)


  return (
		<>
			<Header title={title}/>
			<div style={{display: 'flex', justifyContent: 'flex-start', gap: 4}}>
	     	<svg width={500} height={500} style={{'backgroundColor': 'white', border: '1px solid black'}}> </svg>
			 	<svg width={500} height={500} style={{'backgroundColor': 'white', border: '1px solid black'}}> </svg>
			 </div>
		</>
  );
}

export default App;
