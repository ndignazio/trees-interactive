// if the data you are going to import is small, then you can import it using es6 import
// (I like to use use screaming snake case for imported json)
// import MY_DATA from './app/data/example.json'

import { myExampleUtil } from './utils';
import { select } from 'd3-selection';
import { json, csv } from 'd3-fetch';
import { geoPath, geoAlbersUsa } from 'd3-geo';

import { mouse, pointer } from 'd3';
import { tip } from 'd3-tip';
// this command imports the css file, if you remove it your css wont be applied!
//import './main.css';
console.log('imported.')





// Remove all child nodes - used to clear order summary table
function removeChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

function checkChecker(nodelist) {
  let obj = {}
  nodelist = Array.from(nodelist)
  for (var node of nodelist) {
    if (node.checked === true) {
      const id = node.id
      //console.log(id)
      if (obj.hasOwnProperty(id) === false) {
        //console.log("creating new property")
        obj[id] = [node.value]
      } else {
        //console.log("property already exists, appending")
        obj[id].push(node.value)
      }
    }
  }
  return obj
}

function filterUpdate(data, filters, borough) {
  console.log("In filterUpdate")
  //console.log(data.features)
  filters.boro_name = [borough]
  //console.log(filters)
  return {
    ...data, features: data.features.filter(obj => {
      //console.log(obj.properties)
      for (let prop of Object.keys(filters)) {
        // as soon as one of the filters arrays doesn't have at least one match return false
        if (!filters[prop].some(filterValue => obj.properties[prop] === filterValue)) {
          return false;
        }
      }
      // if all of the filters arrays have at least some values that match return true
      return true;
    })
  };
}


function unique(data, key) {
  return Array.from(data.reduce((acc, row) => acc.add(row[key]), new Set()));
}

json('./data/tracts.geojson').then(function (bb) {
  //console.log(bb)

  //let filter = bb.features.filter(d => d.properties.cdeligibil === "I")





  let width = 500, height = 500;



  const dropdowns = select('#app')
    .append('div')
    .style('display', 'flex')
    .selectAll('.drop-down')
    .data(['Select Borough'])
    .join('div');

  dropdowns.append('div').text(d => d);

  let columns = ['Manhattan', 'Staten Island', 'Queens', 'Bronx', 'Brooklyn']
  let borough = null

  dropdowns
    .append('select')
    .on('change', (event) => {
      borough = event.target.value;
      renderChart();
    })
    .selectAll('option')
    .data(dim => columns.map(column => ({ column, dim })))
    .join('option')
    .text(d => d.column)
    .property('selected', d =>
      d.column === borough,
    );

  let svg = select("#app").append('svg')
    .style("width", width).style("height", height);

  const svgContainer = select('#app')
    .append('div')
    .attr('class', 'chart-container')
    .style('position', 'relative');

  const tooltip = svgContainer
    .append('div')
    .attr('id', 'tooltip')
    .style('display', 'none');

  //const tooltip = tip().attr('class', 'd3-tip').html(function (d) { return d; });

  var mouseover = function (d) {
    Tooltip
      .style("opacity", 1)
      .select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function (d) {
    Tooltip
      .html("The exact value of<br>this cell is: " + d.properties.GEO_ID)
      .style("left", (d3.mouse(this)[0] + 70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function (d) {
    Tooltip
      .style("opacity", 0)
      .select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }



  function renderChart() {
    const g = document.querySelector('svg');
    console.log('svg')
    console.log(g)
    removeChildren(g)

    removeChildren(svg)


    let filtered = { ...bb, features: bb.features.filter(d => d.properties.boro_name === borough) };
    console.log("Attempting to show median income")
    console.log(typeof (filtered))
    console.log(bb)
    console.log(filtered)


    const c = document.querySelectorAll(".check")

    const checked = checkChecker(c)
    const f = filterUpdate(bb, checked, borough)
    console.log(borough)
    console.log("f:")
    console.log(f)

    let width = 500, height = 500;
    let projection = geoAlbersUsa();
    projection.fitSize([width, height], filtered);
    let geoGenerator = geoPath()
      .projection(projection);

    svg.selectAll('path')
      .exit()
      .remove()


    svg.append('g').selectAll('path')
      .data(filtered.features)
      .join(
        enter =>
          enter
            .append('path')
            .attr('d', geoGenerator),
        update =>
          update.call(el =>
            el
              .attr('d', geoGenerator
              )
          ),
      )
      .attr('fill', 'white')
      .attr('stroke', '#000')


    svg.append('g').selectAll('path')
      .data(f.features)
      .join(
        enter =>
          enter
            .append('path')
            .attr('d', geoGenerator),
        update =>
          update.call(el =>
            el
              .attr('d', geoGenerator)
          )
      )
      .attr('fill', 'steelblue')
      .attr('stroke', '#000')
      /* .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide) */
      .on('mouseenter', (e, d) => {
        const [x, y] = pointer(e)
        tooltip
          .attr('transform', `translate(${x}, ${y})`)
          .style('display', 'block')
          .style('right', `${e.offsetX}px`)
          .style('top', `${e.offsetY}px`)
          .html(`<div><p>Census Tract ${d.properties.GEO_ID}</p>
                      <p>Median Income: ${d.properties.median_income}</p>
                      <p>Life Expectancy: ${d.properties.life_expectancy}</p>
                      <p>Percent White: ${d.properties.percent_white}</p>
                      <p>Street Trees per square foot: ${d.properties.trees_normalized}</p>
                      </div>`)
      })
      .on('mouseleave', (e, d) => tooltip.style('display', 'none'))
      ;
  }
});


