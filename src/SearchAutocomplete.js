import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'


function SearchAutocomplete({setSelectedPlayers, selectedPlayers, aggData}) {
  return (
		<Autocomplete
			multiple
			onChange={(e, v) => {
				setSelectedPlayers(v.map((d) => d.id))
			}}
			value={selectedPlayers.map((d) => {
				const player = aggData.find((a) => a.playerId === d )
				return {label: player?.playerFullName, id: player?.playerId}
			})}
			options={aggData?.map((d) => ({label: d.playerFullName, id: d.playerId}))}
			getOptionLabel={(option) => option.label}
			renderInput={(params) => <TextField {...params} label="Select Players" />}
			isOptionEqualToValue={(a, b) => a.id === b.id}
		/>
  );
}

export default SearchAutocomplete;
