let item = document.getElementsByClassName("departure-content")[0]
item.style.display="none"

const map = initMap()


//

var previousSelectedDifficultyOptions = new Set()
function difficultyFilter(base, classList){

    if (previousSelectedDifficultyOptions.has(classList[0])){
        previousSelectedDifficultyOptions.delete(classList[0])
        document.getElementsByClassName(classList[0])[0].classList.remove('highlighted')
    }else{
        previousSelectedDifficultyOptions.add(classList[0])
        document.getElementsByClassName(classList[0])[0].classList.add('highlighted')
    }
    let url=base+'/get-routes-with-difficulty'
    const param={
        difficulty: Array.from(previousSelectedDifficultyOptions)
    }
    if (previousSelectedDifficultyOptions.size===0){
        document.querySelectorAll('.route-item').forEach((item,_ )=>{
            if (item.classList.contains('hide')){
                item.classList.remove('hide')
            }

        })
    }

    if (previousSelectedDifficultyOptions.size >0){
        getRoutesWithDifficultyFilters(url, param)
    }

    function getRoutesWithDifficultyFilters(url, param) {
        // Using Fecth API with reference to https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        fetch(url, {
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(param)

        }).then(response=> response.json())
            .then(data=>{
                // data['routes'].Name
                let i=0
                document.querySelectorAll('.route-item').forEach((item,_ )=>{
                    if (!data['routes'].includes(item.id)){
                        item.classList.add('hide')
                    }else{
                        item.classList.remove('hide')
                    }
                    i+=1
                })
            }).catch(error => console.error('Error:', error))
    }

}




function toggleCard(){
    var classlist = document.getElementsByClassName("listContainer_maplist");
    if (classlist[0].classList.contains("show") ){
        classlist[0].classList.remove("show");
        classlist[0].classList.add("hide")
    }else{
        classlist[0].classList.remove("hide");
        classlist[0].classList.add("show")
    }

    var arrowClassList =document.getElementsByClassName('anticon')
    if (arrowClassList[0].classList.contains("anticon-left") ){
        arrowClassList[0].classList.remove("anticon-left");
        arrowClassList[0].classList.add("anticon-right")
        arrowClassList[0].innerHTML="<svg viewBox=\"64 64 896 896\" focusable=\"false\" data-icon=\"right\" width=\"1em\" height=\"1em\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z\"></path></svg>";
    }else{
        arrowClassList[0].classList.remove("anticon-right");
        arrowClassList[0].classList.add("anticon-left")
        arrowClassList[0].innerHTML="<svg viewBox=\"64 64 896 896\" focusable=\"false\" data-icon=\"left\" width=\"1em\" height=\"1em\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z\"></path></svg>"
    }
}

function chooseFilterType(id){
    if(id==="option1"){
        document.getElementsByClassName("filter-options-list-container")[0].style.display = 'block'
    }
    if(id==="option2"){
        document.getElementsByClassName("filter-options-list-container")[0].style.display = 'none'
    }
}

document.querySelectorAll('.slider-option').forEach((item,index) => {
    item.addEventListener('click', function() {
        // Remove all the active class
        document.querySelectorAll('.slider-option').forEach(innerItem => {
            innerItem.classList.remove('active');
        });
        // Add active class to the clicked option
        this.classList.add('active');
    });
});

function gotoDetail(baseAddress, routeId){
    document.getElementsByClassName("routes-selection-container")[0].style.display="none"
    document.getElementsByClassName("chosen-route-details")[0].style.display="block"

    let elevationGraph=document.createElement("div")
    elevationGraph.className="elevation-graph"
    document.getElementsByClassName("elevation-graph-container")[0].appendChild(elevationGraph)
    let dict = {1:'easy-option', 2:'medium-option', 3:'hard-option'}



    const url=baseAddress+'/get-route-data'
    const param={
        RouteId: routeId
    }

    fetch(url,{
        method: "POST",
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(param)
    })
        .then(response => response.json())
        .then(data => {
            var coordinates = JSON.parse(data)
            const geojson = {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': []
                }
            };

            // Route animation implemented with the reference to https://docs.mapbox.com/mapbox-gl-js/example/animate-a-line/
            map.addSource('route', {
                'type': 'geojson',
                'data': geojson
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#ffa500',
                    'line-width': 7,
                    'line-opacity':0.7
                }
            });

            let index = 0; // initialize index to locate current animation progress

            function animateLine() {
                // check whether all coordinates have been drawn
                if (index < coordinates.length) {
                    // update coordinates of geojson object
                    geojson.geometry.coordinates = coordinates.slice(0, index + 1);

                    // update the map
                    map.getSource('route').setData(geojson);

                    // increase the index to draw route till next coordinate
                    index+=4;

                    // request the next animation frame
                    requestAnimationFrame(animateLine);
                } else {
                    // finish the animation
                    console.log("Animation completed");
                }
            }
            map.flyTo({center: getCoordCenter(coordinates),zoom: 10})
            map.once('moveend', () => {animateLine()})





            // Add a GeoJSON source with the starting point of the route, implemented with reference to https://docs.mapbox.com/mapbox-gl-js/example/geojson-markers/
            map.addSource('start-point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                    // feature for Mapbox DC
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': coordinates[0]
                            },
                            'properties': {
                                'title': 'Start Point'
                            }
                        }
                    ]
                }
            });

            // Add a symbol layer
            map.addLayer({
                'id': 'start-point',
                'type': 'symbol',
                'source': 'start-point',
                'layout': {
                    'icon-image': 'custom-marker', // get the title name from the source's "title" property
                    'text-field': ['get', 'title'],
                    'icon-anchor':'bottom',
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top'
                }
            });


            // map.addSource('bike-point', {
            //     'type': 'geojson',
            //     'data': {
            //         'type': 'FeatureCollection',
            //         'features': [
            //             {
            //                 // feature for Mapbox DC
            //                 'type': 'Feature',
            //                 'geometry': {
            //                     'type': 'Point',
            //                     'coordinates': coordinates[0]
            //                 },
            //                 'properties': {
            //                     'title': 'Start Point'
            //                 }
            //             }
            //         ]
            //     }
            // });
            //
            // // Add a symbol layer
            // map.addLayer({
            //     'id': 'bike-point',
            //     'type': 'symbol',
            //     'source': 'bike-point',
            //     'layout': {
            //         'icon-image': 'bicycle', // get the title name from the source's "title" property
            //         'text-field': ['get', 'title'],
            //         'icon-anchor':'bottom',
            //         'icon-size':1,
            //         'text-font': [
            //             'Open Sans Semibold',
            //             'Arial Unicode MS Bold'
            //         ],
            //         'text-offset': [0, 1.25],
            //         'text-anchor': 'top'
            //     }
            // });


        })
        .catch(error => console.error('Error:', error));
        //

        const routesUrl = baseAddress + '/get-routes-summary'
        fetch(routesUrl,{
            method: "POST",
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(param)
        })
            .then(response => response.json())
            .then(data => {

                loadElevationPlot(data.length, data.elevations)
                document.getElementsByClassName("chosen-route-title-container")[0].innerHTML="<h6>"+data.name+"</h6>"
                document.getElementById("duration-detail").innerHTML=data.duration
                document.getElementById("distance-detail").innerHTML=data.length+" mi"
                document.getElementsByClassName(dict[data.difficulty])[1].classList.remove('hide')

            }).catch(error => console.error('Error:', error))


}

function gotoMenu(baseAddress, routeId){
    map.removeLayer('route')
    map.removeSource('route')
    map.removeLayer('start-point')
    map.removeSource('start-point')

    document.getElementsByClassName("chosen-route-details")[0].style.display="none"
    document.getElementsByClassName("routes-selection-container")[0].style.display="block"
    document.getElementsByClassName("elevation-graph")[0].remove()
    document.getElementsByClassName("chosen-route-title-container")[0].innerHTML=""

    let dict = {1:'easy-option', 2:'medium-option', 3:'hard-option'}
    document.getElementsByClassName(dict[1])[1].classList.add('hide')
    document.getElementsByClassName(dict[2])[1].classList.add('hide')
    document.getElementsByClassName(dict[3])[1].classList.add('hide')


}


function toggleDepartureList(){
    let item = document.getElementsByClassName("departure-content")[0]
    let display_style = item.style.display
    // print(display_style)

    let icon = document.getElementsByClassName("departure-menu-icon")[0]
    if (display_style === "none")
    {
        item.style.display="block"
        icon.style.transform="scaleY(-1)"
    }else{
        item.style.display="none"
        icon.style.transform="scaleY(1)"
    }

}

// Used to get the center of the coordinates for relocating map center. The implementation of algorithm is referred to the example code by ChatGPT
function getCoordCenter(coordinates) {
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;

    coordinates.forEach(coord => {
        // convert long, lat to arc
        let lat = coord[1] * Math.PI / 180;
        let long = coord[0] * Math.PI / 180;

        // To Cartesian coordinate system
        x += Math.cos(lat) * Math.cos(long);
        y += Math.cos(lat) * Math.sin(long);
        z += Math.sin(lat);
    });

    // Compute the average
    let total = coordinates.length;
    x = x / total;
    y = y / total;
    z = z / total;

    // Convert back to longitude and latitude
    let centralLong = Math.atan2(y, x);
    let centralSqrRoot = Math.sqrt(x * x + y * y);
    let centralLat = Math.atan2(z, centralSqrRoot);

    return [centralLong * 180 / Math.PI, centralLat * 180 / Math.PI];
}


// Implemented with the reference to https://echarts.apache.org/handbook/en/how-to/chart-types/line/basic-line
function loadElevationPlot(totalDistance,elevations){
    let elevationPlot=echarts.init(document.getElementsByClassName("elevation-graph")[0])
    // totalDistance=100
    let totalTicks= elevations.length
    let xAxisData = Array.from({ length: totalTicks+1 }, (_, i) => (totalDistance / totalTicks) * i);
    // console.log(xAxisData)
    let option={
        xAxis:{
            type: 'category',
            boundaryGap: false,
            data: xAxisData,

            axisLabel: {
                formatter: function (value, index) {

                    return (+value).toFixed(2) + ' mi';
                }
            },
            axisTick: {
                alignWithLabel: true,
                // interval: 120 // show all the ticks
            },

        },
        yAxis:{

            name:'Elevation (m)',
            splitLine:{ show:false}
        },
        tooltip: {
            trigger: 'axis',

            formatter: function (params) {
                let result = "Elevation: "
                params.forEach((param)=>{
                    result += param.value + 'm<br/>';
                })
                return result;

            },
            axisPointer: {
                animation: false
            }
        },

        series: [{
            name: 'Elevatrion',
            type: 'line',
            showSymbol:false,
            data: elevations,
            markPoint: {
                symbolSize:40,
                data: [
                    {type: 'max', name: 'Peak',label: {
                            show: true,
                            // Use 2 digits after decimal points
                            formatter: function(params) {
                                return `${params.name}: ${params.value.toFixed(2)}m`;
                            }
                        }},
                    {type: 'min', name: 'Valley',label: {
                            show: true,

                            formatter: function(params) {
                                return `${params.name}: ${params.value.toFixed(2)}m`;
                            }
                        }},
                    {coord:[0,elevations[0]], name: 'Start', value:+elevations[0],label: {
                            show: true,
                            formatter: function(params) {
                                return `${params.name}: ${params.value.toFixed(2)}m`;
                            }
                        }
                    },
                    {coord:[elevations.length-1,elevations[elevations.length-1]], name: 'End',value:+elevations[elevations.length-1],label: {
                            show: true,
                            formatter: function(params) {
                                return `${params.name}: ${params.value.toFixed(2)}m`;
                            }
                        }
                    },


                ]
            },
            markLine: {
                symbol:['none','none'],
                data: [
                    {type: 'average', name: 'Average',label: {
                            show: true,
                            position: 'insideEndTop',

                            formatter: function(params) {
                                return `${params.name}: ${params.value}m`;
                            }
                        }},
                    {xAxis:0, name: 'Start', value:+elevations[0],label: {
                            show: true,
                            formatter: function(params) {
                                return `${params.name}: ${(+elevations[0]).toFixed(2)}m`;
                            }
                        }},
                    {xAxis:elevations.length-1, name: 'End',value:+elevations[elevations.length-1],label: {
                            show: true,
                            formatter: function(params) {
                                return `${params.name}: ${(+elevations[elevations.length-1]).toFixed(2)}m`;
                            }
                        }
                        },
                ]
            }
        }]
    }

    elevationPlot.setOption(option);
}

function initMap(){
    mapboxgl.accessToken = 'pk.eyJ1IjoieXV5YW5neGluIiwiYSI6ImNsczkzOXhjMTAzOWwyaXBsZjR1OG8wbmMifQ.WoIX7izTdmT5fsi8lJCcug';
    const map = new mapboxgl.Map({
        container: 'bigmapContainer', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [-5.81, 57.43], // starting position [lng, lat]
        zoom: 6, // starting zoom
    });
    map.on('style.load', () => {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
// add the DEM source as a terrain layer with exaggerated height
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    });
    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
        }
    )
    return map
}
// const initMap= () => {
//     mapboxgl.accessToken = 'pk.eyJ1IjoieXV5YW5neGluIiwiYSI6ImNsczkzOXhjMTAzOWwyaXBsZjR1OG8wbmMifQ.WoIX7izTdmT5fsi8lJCcug';
//     const map = new mapboxgl.Map({
//         container: 'bigmapContainer',
//         style: 'mapbox://styles/mapbox/streets-v12', // 'mapbox://styles/mapbox/dark-v10',
//         center: [-5.721575, 57.541787],
//         zoom: 8,
//         dragPan: true,
//         dragRotate: false,
//         renderWorldCopies: false,
//         projection: 'mercator', //'naturalEarth',
//         // maxBounds: [[-280, -90], [280, 90]],
//     });
//     window.map = map;
// }
//
// initMap()








