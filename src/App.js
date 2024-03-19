import Header from './Header.js'
import  { useState } from 'react';

function App() {
	const [title] = useState('TruMedia Data Viz Project')
  return (
		<>
			<Header title={title}/>
			<div style={{display: 'flex', justifyContent: 'flex-start', gap: 4}}>
	     	<svg width={500} height={500} style={{'background-color': 'white', border: '1px solid black'}}> </svg>
			 	<svg width={500} height={500} style={{'background-color': 'white', border: '1px solid black'}}> </svg>
			 </div>
		</>
  );
}

export default App;
