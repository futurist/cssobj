var pagecss = {
  'html,body': {
    height: ['100%', 100],
    margin:0,
    padding:0,
    p:{
      '\\&:before &':{
        d:{font:123},
        content:'"-"'
      },
      color:'red'
    }
  },
  table: {
    '':[{width:100}],
    width: '100%',
    height: '100%',
    'table-layout': 'fixed'
  },
  textarea: {
    $id: 'textarea',
    $order:2,
    display: 'block',
    margin:0,
    padding:0
  },
  'h3': {
    $id: 'h3',
    $order:1,
    fontSize: 16,
    lineHeight:1.2,
    marginTop: 10,
    marginBottom: 10,
    color: 'green'
  },
  '@media (>800px)':{
    '@keyframes abc':{
      '10%':{
        color: 'blue',
        opacity: .5,
      },
      '20%':{
        color: 'red'
      }
    },
    h3:{
      color:'red'
    },
    p:{
      fontSize:16,
      color: ['red','#fcc']
    },
    '@media (<1000px), (>900px)':{
      h3:{
        color:'blue'
      }
    }
  },
  '@media (>1000px)':{
    h3:{
      color:'grey'
    }
  }
}
