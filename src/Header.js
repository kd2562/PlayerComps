import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'


function Header({title}: {title: string}) {
  return (
		<Box style={{
			height: '70px',
			backgroundColor: '#597E52',
			position: 'absolute',
			top: '0px', left: '0px',
			width: '100%',
			borderBottom: '1px solid gray',
			boxShadow: `black 0px 0px 10px`}}>
	    <Typography variant="h2" sx={{ paddingLeft: '10px', color: '#F1E4C3', fontSize: '30px', marginTop: '20px', marginBottom: '20px', fontFamily: 'Trebuchet MS'}}>
	      {title}
	    </Typography>
		</Box>
  );
}

export default Header;
