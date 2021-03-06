var expect = require('chai').expect
var util = require('util')
var cssobj_plugin_post_gencss = require('../node_modules/cssobj-plugin-post-gencss/cjs/cssobj-plugin-post-gencss.js')

var _cssobj = require('../dist/cssobj.cjs.js')
var cssobj

describe('test cssobj', function(){

  beforeEach(function() {

    cssobj = _cssobj({
      plugins:{
        post: cssobj_plugin_post_gencss()
      }
    })

  })

  //
  // option test
  describe('test cssobj options', function() {

    it('css with 2 space indent', function() {

      var ret = cssobj(
        {p:{color:'red'}},
        {indent:'  '}
      )

      console.log(ret)

      expect(ret.css.trim()).deep.equal(
`p {
color: red;
}`
      )

    })

  })

  //
  // function test
  describe('test selector without class', function() {

    it('css with css hacks', function() {

      var ret = cssobj({p:{'_font_size\\0/':'12px', '*background-color':'#fff'}})
      expect(ret.css.trim()).deep.equal(
`p {
_font_size\\0/: 12px;
*background-color: #fff;
}`
      )

    })

    it('css from camel case', function() {

      var ret = cssobj({p:{'_fontSize':'12px', 'background-color':'#fff'}})
      expect(ret.css.trim()).deep.equal(
`p {
_font-size: 12px;
background-color: #fff;
}`
      )

    })


    it('single child selector', function() {

      var ret = cssobj({div:{
        'fontSize':'12px',
        'p':{
          color:'red'
        }
      }}, {indent:'  '})
      expect(ret.css.trim()).deep.equal(
`div {
font-size: 12px;
}
div p {
color: red;
}`
      )

    })

    it('comma in child selector', function() {

      var ret = cssobj({'div,table':{
        'fontSize':'12px',
        'p,span':{
          color:'red'
        }
      }}, {indent:'  '})
      expect(ret.css.trim()).deep.equal(
`div,table {
font-size: 12px;
}
div p,div span,table p,table span {
color: red;
}`
      )

    })

    it('using & inside child selector', function() {

      var ret = cssobj({div:{
        'fontSize':'12px',
        '&:before, &:after':{
          'content':'"---"'
        }
      }}, {indent:'  '})
      expect(ret.css.trim()).deep.equal(
`div {
font-size: 12px;
}
div:before, div:after {
content: "---";
}`
      )

    })

    it('selector with attribute []', function() {

      var ret = cssobj({'p[title="abc"]':{color:'red'}})
      expect(ret.css.trim()).deep.equal(
`p[title="abc"] {
color: red;
}`
      )

    })

    it('selector with comma inside attribute []', function() {

      var ret = cssobj({'p[title="a,bc"],div':{
        span:{
          color:'red'
        }
      }}, {indent:'  '})
      expect(ret.css.trim()).deep.equal(
`p[title="a,bc"] span,div span {
color: red;
}`
      )

    })

    it('selector with comma inside psuedo ()', function() {

      var ret = cssobj(
        {':-moz-any(ol, ul, menu[title="a,b"], dir) dd, :-moz-any(ol, ul, menu, dir) ul':{  span: {color:'red'} }}
        , {indent:'  '}
      )
      expect(ret.css.trim()).deep.equal(
`:-moz-any(ol, ul, menu[title="a,b"], dir) dd span, :-moz-any(ol, ul, menu, dir) ul span {
color: red;
}`
      )

    })

    xit('css with reset.css', function() {

      var ret = cssobj({p:{'_fontSize':'12px', 'background\\Color':'#fff'}}, {propSugar:0})
      expect(ret.css.trim()).deep.equal(
`p {
_fontSize: 12px;
background\\Color: #fff;
}`
      )

    })


  })

  //
  // test with local class name
  describe('test with local class name', function() {

    it('local class name with random string', function() {

      // random string cannot test right,
      // so using regexp to test format
      var ret = cssobj({'.red':{
        'color':'red',
      }})
          .css
          .trim()
          .split(/\n/)
      expect(ret.shift()).match(/^._\w{6,7}\d+_red {/)
      expect(ret.join('\n')).equal(
`color: red;
}`
      )

    })

    // below will using _prefix_ as prefix
    it('local class name with custom prefix', function() {

      cssobj().options.prefix = '_prefix_'

      var ret = cssobj({'.red':{
        'color':'red',
      }}, {prefix: '_prefix_'}).css.trim()
      expect(ret).equal(
`._prefix_red {
color: red;
}`
      )

    })

    it('local class name with :global escape 1', function() {

      cssobj().options.prefix = '_prefix_'

      var ret = cssobj({':global(.red).bold':{
        'color':'red',
      }}, {prefix: '_prefix_'}).css.trim()
      expect(ret).equal(
`.red._prefix_bold {
color: red;
}`
      )

    })

    it('local class name with :global escape 2', function() {

      cssobj().options.prefix = '_prefix_'

      var ret = cssobj({':global(.red.green .blue).bold':{
        'color':'red',
      }}, {prefix: '_prefix_'}).css.trim()
      expect(ret).equal(
`.red.green .blue._prefix_bold {
color: red;
}`
      )

    })

    it('local class name with ! escape 1', function() {

      cssobj().options.prefix = '_prefix_'

      var ret = cssobj({'.!red.bold':{
        'color':'red',
      }}, {prefix: '_prefix_'}).css.trim()
      expect(ret).equal(
`.red._prefix_bold {
color: red;
}`
      )

    })

    it('local class name with ! escape 2', function() {

      cssobj().options.prefix = '_prefix_'

      var ret = cssobj({'.!red .!green .bold':{
        'color':'red',
      }}, {prefix: '_prefix_'}).css.trim()
      expect(ret).equal(
`.red .green ._prefix_bold {
color: red;
}`
      )

    })

    it('local class name with pre-defined local name', function() {

      cssobj().options.prefix = '_prefix_'
      cssobj().options.localNames = {red:'_custom_sel'}

      var ret = cssobj({'.red .green .!bold':{
        'color':'red',
      }}, {prefix: '_prefix_'}, {red:'_custom_sel'}).css.trim()
      expect(ret).equal(
`._custom_sel ._prefix_green .bold {
color: red;
}`
      )

    })

    it('disable local class name', function() {

      cssobj().options.local = false

      var ret = cssobj({'.red .!bold :global(.test)':{
        'color':'red',
      }}, {local:false}, {red:'_custom_sel'})
      expect(ret.css.trim()).equal(
`.red .bold .test {
color: red;
}`
      )

      expect(ret.map).deep.equal({
        red:'red'
      })

    })

  })

  //
  // test prop && lastVal

  describe('test prop && lastVal', function() {


    it('prop should invert order as obj', function() {

      var obj = {

        p:{
          fontSize: [123, 456],
          _msZIndex: 999
        }

      }

      var ret = cssobj(obj)

      expect(ret.root.children.p.prop).deep.equal({
        fontSize: [456, 123],
        _msZIndex: [999]
      })

      expect(ret.root.children.p.lastVal).deep.equal({
        fontSize: 456,
        _msZIndex: 999
      })

    })

  })

  //
  //test array support

  describe('test array support', function() {

    it('object inside array', function() {

      var ret = cssobj({
        d:[{color:123}, {font:'"Arial"', color:'blue'}]
      }, {indent:'  '})

      expect(ret.css).equal(
        `d {
color: 123;
}
d {
font: "Arial";
color: blue;
}
`
      )

    })

    it('properties inside array', function() {

      var ret = cssobj({
        p:[{font:[function(){return 'Helvetica'}, '"Arial"'], color:'blue'}]
      }, {indent:'  '})

      expect(ret.css).equal(
        `p {
font: Helvetica;
font: "Arial";
color: blue;
}
`
      )

    })

    it('empty string property as array', function() {

      var ret = cssobj({
        p:{'': [{font:[function(){return 'Helvetica'}, '"Arial"'], color:'blue'}]}
      }, {indent:'  '})

      expect(ret.css).equal(
        `p {
font: Helvetica;
font: "Arial";
color: blue;
}
`
      )

    })

  })

  //
  //test atRules
  describe('test @rules top level', function() {


    it('@import rule single', function() {

      var ret = cssobj({
        "@import": "url(\"fineprint.css\") print",
        d:{color:123}
      }, {indent:'  '})

      expect(ret.css.trim()).equal(
`@import url("fineprint.css") print;
d {
color: 123;
}`
      )

    })


    it('@import rule with multiple', function() {

      var ret = cssobj({
        '': [
          {"@import": "url(\"fineprint1.css\") print"},
          {"@import": "url(\"fineprint2.css\") print"},
          {"@import": "url(\"fineprint3.css\") print"},
        ],
        d:{color:123}
      }, {indent:'  '})

      expect(ret.css).equal(

        // child always come first
        `d {
color: 123;
}
@import url("fineprint1.css") print;
@import url("fineprint2.css") print;
@import url("fineprint3.css") print;
`
        // version 0.1 result
//         `@import url("fineprint1.css") print;
// @import url("fineprint2.css") print;
// @import url("fineprint3.css") print;
// d {
// color: 123;
// }`
      )

    })


    it('@import rule with multiple inside @supports', function() {

      var ret = cssobj({
        '@supports (import: true)':{
          "@import": "url(\"fineprint.css\") print",
          '': [
            {"@import": "url(\"fineprint1.css\") print"},
            {"@import": "url(\"fineprint2.css\") print"},
            {"@import": "url(\"fineprint3.css\") print"},
          ],
          d:{color:123}
        }
      }, {indent:'  '})

      expect(ret.css).equal(
        `@supports (import: true) {
@import url("fineprint.css") print;
d {
color: 123;
}
}
@supports (import: true) {
@import url("fineprint1.css") print;
}
@supports (import: true) {
@import url("fineprint2.css") print;
}
@supports (import: true) {
@import url("fineprint3.css") print;
}
`
        // version 0.1 result
//         `@supports (import: true) {
// @import url("fineprint.css") print;
// @import url("fineprint1.css") print;
// @import url("fineprint2.css") print;
// @import url("fineprint3.css") print;
// d {
// color: 123;
// }
// }`
      )

    })


    it('@font-face rule top level', function() {

      var ret = cssobj({
        "@font-face": {
          "font-family": '"Bitstream Vera Serif Bold"',
          "src": 'url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf")'
        }
      }, {indent:'  '})

      expect(ret.css.trim()).equal(
        `@font-face {
font-family: "Bitstream Vera Serif Bold";
src: url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf");
}`
      )

    })

    it('@keyframes top level', function() {

      var ret = cssobj({
        "@keyframes identifier1": {
          "0%": {
            "top": 0,
            "left": 0
          },
          "10%": {
            "top": 20,
            "left": 20
          }
        }
      }, {indent:'  '})

      expect(ret.css.trim()).equal(
`@keyframes identifier1 {
0% {
top: 0;
left: 0;
}
10% {
top: 20;
left: 20;
}
}`
      )

    })

    it('@supports top level with @import, @keyframes', function() {

      var ret = cssobj({
        "@supports (animation-name: test)": {
          "@import": "url(\"fineprint.css\") print",
          "d": {
            "color": 123
          },
          "@keyframes identifier": {
            "0%": {
              "top": 0,
              "left": 0
            },
            "10%": {
              "top": 20,
              "left": 20
            }
          }
        }
      }, {indent:'  '})

      expect(ret.css.trim()).equal(
`@supports (animation-name: test) {
@import url("fineprint.css") print;
d {
color: 123;
}
@keyframes identifier {
0% {
top: 0;
left: 0;
}
10% {
top: 20;
left: 20;
}
}
}`
      )

    })

    it('@media at top level', function() {

      cssobj().options.prefix = '_prefix_'

      var ret = cssobj(
        {
          "@media only screen and (min-device-width : 320px) and (max-device-width : 480px)": {p:{color:'red'}},
          "@media only screen and (min-width : 321px)": {p:{color:'blue'}}
        }
        , {indent:'  ', prefix:'_prefix_'})

      expect(ret.css.trim()).equal(
        `@media only screen and (min-device-width : 320px) and (max-device-width : 480px) {
p {
color: red;
}
}
@media only screen and (min-width : 321px) {
p {
color: blue;
}
}`
      )

    })

    it('@media supports with multi-level', function() {

      cssobj().options.prefix = '_prefix_'

      var ret = cssobj(
        {
          ".p": {
            "color": "red",
            "back": "23ret",
            "@media (min-width:320px)": {
              "color": "red2",
              "@media c2&c": {
                "_color": "blue",
                "@media (max-width:768px)": {
                  "color": 234
                }
              },
              "@font-face": {
                "style": 1
              },
              "&.d": {
                "x": 1
              }
            }
          }
        }
        , {indent:'  ', prefix:'_prefix_'})

      expect(ret.css.trim()).equal(
        `._prefix_p {
color: red;
back: 23ret;
}
@media (min-width:320px) {
._prefix_p {
color: red2;
}
@font-face {
style: 1;
}
._prefix_p._prefix_d {
x: 1;
}
}
@media (min-width:320px) and c2&c {
._prefix_p {
_color: blue;
}
}
@media (min-width:320px) and c2&c and (max-width:768px) {
._prefix_p {
color: 234;
}
}`
      )

    })



        it('@media supports with multi-level comma split', function() {

      cssobj().options.prefix = '_prefix_'

          var ret = cssobj(
        {
          ".p": {
            "color": "red",
            "back": "23ret",
            "@media & (cond,ition)": {
              "color": "red2",
              "@media c2,c3": {
                "_color": "blue",
                "@media (max:324px),(min:111px)": {
                  "color": 234
                }
              },
              "@font-face": {
                "style": 1
              }
            }
          }
        }
        , {indent:'  ', prefix:'_prefix_'})

      expect(ret.css.trim()).equal(
        `._prefix_p {
color: red;
back: 23ret;
}
@media & (cond,ition) {
._prefix_p {
color: red2;
}
@font-face {
style: 1;
}
}
@media & (cond,ition) and c2,& (cond,ition) and c3 {
._prefix_p {
_color: blue;
}
}
@media & (cond,ition) and c2 and (max:324px),& (cond,ition) and c2 and (min:111px),& (cond,ition) and c3 and (max:324px),& (cond,ition) and c3 and (min:111px) {
._prefix_p {
color: 234;
}
}`
      )

    })




  })



  //
  // test with update

  describe('test with update', function() {

    it('should diff right in result', function() {

      var ret = cssobj({
        dd:{font:123},
        p:{
          $id: 'abc',
          color: 'red',
          textAlign: 'right',
          p1:{font:1234}
        },
        p2:{
          $id: 'xyz',
          color: 'blue'
        }
      }, {indent:'  '})

      expect(ret.css).equal(
        `dd {
font: 123;
}
p {
color: red;
text-align: right;
}
p p1 {
font: 1234;
}
p2 {
color: blue;
}
`)

      expect(Object.keys(ret.ref)).deep.equal(['abc', 'xyz'])

      var abc = ret.ref.abc.obj
      abc.color = function(last, n, opt){
        // version 0.1 it's n.selector
        return n.selText
      }
      abc.left = '10px'
      delete abc.textAlign

      delete ret.obj.dd

      ret.obj.div = {
        float: 'left'
      }

      ret.update()

      expect(ret.css).equal(
        `p {
color: p;
left: 10px;
}
p p1 {
font: 1234;
}
p2 {
color: blue;
}
div {
float: left;
}
`)

      expect(ret.diff.added.length).equal(1)
      expect(ret.diff.added[0].key).equal('div')

      expect(ret.diff.removed.length).equal(1)
      expect(ret.diff.removed[0].key).equal('dd')

      expect(ret.diff.changed.length).equal(1)
      expect(ret.diff.changed[0].key).equal('p')

      // all the diff key is dashify-ed
      expect(ret.diff.changed[0].diff).deep.equal({
        changed:['color'],
        removed:['textAlign'],
        added:['left']
      })

      ret.obj = {p:{color:'blue'}}

      ret.update()

      expect(ret.css).equal(
        `p {
color: blue;
}
`
      )

      expect('added' in ret.diff).equal(false)
      expect(ret.diff.changed.length).equal(1)
      expect(ret.diff.removed.map(function(v){return v.key})).deep.equal(['p1', 'p2', 'div'])

    })

    // test for update order
    it('should update accroding to $order', function() {

      var obj = {
        p2:{
          $id: 2,
          $order:2,
          color: 'red'
        },
        p1:{
          $id: 1,
          $order:-1,
          color: 'blue'
        },
        p:{
          $id: 0,
          color: 'green'
        }
      }
      var opt = {indent:'  '}
      var ret = cssobj(obj, opt)

      obj.p.color = 10
      obj.p1.color = function(){
        var pNode = ret.nodes.filter(function(v) {
          return obj.p == v.obj
        }).pop()
        return pNode.lastVal.color * 2
      }
      obj.p2.color = function(){
        var pNode = ret.nodes.filter(function(v) {
          return obj.p1 == v.obj
        }).pop()
        return pNode.lastVal.color * 2
      }

      ret.update()

      expect(ret.css).equal(
        `p2 {
color: 40;
}
p1 {
color: 20;
}
p {
color: 10;
}
`
      )


    })


    it('value update function to set node.lastVal', function() {

      var t = {
        color: 0
      }
      var obj = {
        p:t,
        d:{font:'Arial'}
      }
      var ret = cssobj(obj, {indent:'  '})

      var node = ret.root.children.p
      expect(node.lastVal['color']).equal(0)

      // test for normal update based on lastVal
      t.color = function(last) {
        return last+1
      }

      expect(ret.update().css).equal(
        `p {
color: 1;
}
d {
font: Arial;
}
`)
      // test for non value update
      t.color = function(n) {
        return null
      }

      // css will be empty due to null
      expect(ret.update().css).equal(
        // version 0.1 will have empty prop
        `d {
font: Arial;
}
`)

      // test for 0 value update
      t.color = function(n) {
        return 0
      }

      expect(ret.update().css).equal(
        `p {
color: 0;
}
d {
font: Arial;
}
`)
      // test for add new rule
      // add object and register to ref
      t.xyz = {
        $id: 'xyz',
        fontSize: '12px'
      }
      // update node with recursive to take the node
      ret.update()

      // check new ref
      expect(ret.ref.xyz.key).equal('xyz')

      // check css
      expect(ret.css).equal(
        `p {
color: 0;
}
p xyz {
font-size: 12px;
}
d {
font: Arial;
}
`
      )

    })


    it('update ref when remove named obj', function() {

      var obj = {
        p:{
          $id:'xy',
          color:1
        },
        b:{
          $id:'ab',
          color:2
        }
      }

      var ret = cssobj(obj)

      expect(Object.keys(ret.ref)).deep.equal(['xy', 'ab'])

      delete obj.p
      ret.update()

      expect(Object.keys(ret.ref)).deep.equal(['ab'])

    })


  })


  //
  // plugin test
  describe('plugin test', function() {


    it('post plugin', function() {

      var post1 = function(option){
        return function(result){

          expect(option.abc).equal(true)

          expect(result.css).equal(
            `p {
color: red;
}
`
          )

          result.abc = option.abc

          // should return first args to pass to next plugin
          return result

        }
      }

      var post2 = function(result){

        expect(result.abc).equal(true)

      }

      // only one plugin
      cssobj({p:{color:'red'}}, {
        indent:'  ',

        plugins: {
          post: post1({abc:true})
        }

      })

      // pass value to next plugin
      cssobj({p:{color:'red'}}, {
        indent:'  ',
        plugins: {
          post: [post1({abc:true}), post2]
        }
      })

    })


    it('value plugin', function() {

      var node

      function plug1(value) {
        expect(value).equal(2)

        // pass to next plugin
        return value*2
      }

      function plug2(value, key, n){
        node = n
        expect(value).equal(4)
      }

      cssobj().options.plugins = {
          value: [plug1, plug2]
        }

      cssobj({p:{size:2}}, {
        indent:'  '
      })

      // plugin should not effect lastVal
      expect(node.lastVal['size']).equal(2)

    })



    it('update with value plugin', function() {

      function plug(value) {
        return value+'px'
      }

      cssobj().options.plugins.value = plug

      var size = {size:2}
      var ret = cssobj({p:size}, {
        indent:'  ',
      })

      size.size = 10

      ret.obj = {p:size}

      var css = ret.update().css

      expect(css).equal(
        `p {
size: 10px;
}
`
      )

    })

  })


})
