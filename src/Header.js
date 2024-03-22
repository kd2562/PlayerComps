function Header({title}: {title: string}) {
  return (
		<div style={{height: '70px',
			backgroundColor: '#597E52',
			position: 'absolute',
			top: '0px', left: '0px',
			width: '100%',
			borderBottom: '1px solid gray',
			boxShadow: `black 0px 0px 10px`}}>
	    <h2 style={{ paddingLeft: '10px', color: '#F1E4C3', fontSize: '26px'}}>
	      {title}
	    </h2>
		</div>
  );
}

export default Header;
