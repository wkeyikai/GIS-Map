<template>
	<div ref="mapRef">
		<slot :map="map"></slot>
	</div>
</template>
<script setup>
import { onMounted } from 'vue';
import gis from '../lib/gis.js'
console.log('gis',gis)
const props = defineProps({
	center: {
		type: Array,
		default: [121.549535,24.979819]
	},
	level: {
		type: Number,
		default: 10
	},
	cross: {
		type: Boolean,
		default: false
	},
	overview: {
		type: Boolean,
		default: false
	}
})

const mapRef = ref()
let map = ref()
provide('map',map)

onMounted(()=>{
	map.value = new gis.map(mapRef.value)
	map.value.reMap(props.level)
	let poi = props.center
	console.log('poi',poi)
	map.value.setCenter(poi[0],poi[1]);
	map.value.mousewheel()
	props.cross && map.value.tool(new gis.tool.cross)
	props.overview && map.value.tool(new gis.tool.overview)
})
</script>