// if the data you are going to import is small, then you can import it using es6 import
// (I like to use use screaming snake case for imported json)
// import MY_DATA from './app/data/example.json'

import { myExampleUtil } from './utils';
import { select } from 'd3-selection';
import { json, csv } from 'd3-fetch';
import { geoPath, geoAlbersUsa } from 'd3-geo';

import { mouse, pointer } from 'd3';
//import { tip } from 'd3';
// this command imports the css file, if you remove it your css wont be applied!
//import './main.css';




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
  console.log("filters")
  console.log(filters)
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

Promise.all([
  json('./data/tracts.geojson'),
  json('./data/nyctracts.geojson'),
]).then((results) => {
  const [bb, tracts] = results;

  //json('./data/tracts.geojson').then(function (bb) {
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
  let borough = 'Manhattan'

  dropdowns
    .append('select')
    .on('change', (event) => {
      borough = event.target.value;
      //renderChart();
    })
    .selectAll('option')
    .data(dim => columns.map(column => ({ column, dim })))
    .join('option')
    .text(d => d.column)
    .property('selected', d =>
      d.column === borough,
    );

  let update = select("#update")

  update.on("click", (e) => {
    renderChart()
  })

  let svg = select("#app").append('svg')
    .style("width", width).style("height", height);

  let projection = geoAlbersUsa();
  projection.fitSize([width, height], tracts);
  let geoGenerator = geoPath()
    .projection(projection);

  svg.append('g').selectAll('path')
    .data(tracts.features)
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

  const svgContainer = select('#app')
    .append('div')
    .attr('class', 'chart-container')
    .style('position', 'relative');

  const tooltip = svgContainer
    .append('div')
    .attr('id', 'tooltip')
    .style('display', 'none');


  function renderChart() {


    removeChildren(svg)


    let filtered = { ...tracts, features: tracts.features.filter(d => d.properties.boro_name === borough) };
    /*  console.log("Attempting to show median income")
     console.log(typeof (filtered))
     console.log(bb)
     console.log(filtered) */


    const c = document.querySelectorAll(".check")

    const checked = checkChecker(c)
    const f = filterUpdate(bb, checked, borough)
    console.log(borough)
    console.log("f:")
    console.log(f)

    const g = document.querySelector('svg');

    removeChildren(g)

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

    console.log("Just created basemap")


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
      /*       .on('mouseover', function (e, d) {
              console.log(e)
              tooltip
                //.style("stroke", "forestgreen")
                .style("stroke-width", "5px")
                .style("opacity", 0.5)
                .text("<p>Life Expectancy: " + d.properties.life_expectancy + "</p><div id='tipDiv'></div>")
            })
            .on('mouseout', function (d) {
              tooltip
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .style("opacity", 1)
            }) */
      .on('mouseenter', (e, d) =>

        tooltip
          .style('display', 'block')
          .style('left', `${e.offsetX}px`)
          .style('top', `${e.offsetY}px`)
          .style('background-color', 'white')
          .style('border-style', 'solid')
          .html(`<div><p class="tip"><strong>Census Tract ${d.properties.GEO_ID}</strong></p>
                    <p class="tip">Median Income: ${d.properties.median_income}</p>
                    <p class="tip">Neighborhood: ${d.properties.ntaname}</p>
                    <p class="tip">Life Expectancy: ${d.properties.life_expectancy}</p>
                    <p class="tip">Percent White: ${Math.round(d.properties.percent_white * 100) / 100}</p>
                    <p class="tip">Street Tree Density: ${d.properties.tree_density}</p>
                    <p class="tip">Frequency of Dead Trees and Stumps: ${d.properties.percent_not_alive}</p>
                    <p class="tip">Average Tree Diameter: ${d.properties.avg_tree_diam}</p>
                    </div>`),
        select(this)
          .attr('fill', "black")
      )
      .on('mouseleave', (e, d) => tooltip.style('display', 'none'))
      ;

    /* svg.selectAll('path')
      .transition()
      .duration(2000) */
  }
});


/* .html(`<div><p>Census Tract ${d.properties.GEO_ID}</p>
                    <p>Median Income: ${d.properties.median_income}</p>
                    <p>Life Expectancy: ${d.properties.life_expectancy}</p>
                    <p>Percent White: ${d.properties.percent_white}</p>
                    <p>Street Trees per square foot: ${d.properties.trees_normalized}</p>
                    </div>`) */