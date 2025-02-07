<template>
</template>
<script setup>
import { onMounted } from 'vue';
// import gis from '../lib/gis.js'

const props = defineProps({
	lon: {
		type: Number,
		default: 0
	},
	lat: {
		type: Number,
		default: 0
	},
	imgSrc: {
		type: String,
		default: ''
	},
	type: {
		type: String,
		default: ''
	}
})

const map = inject('map')

onMounted(()=>{
	// map.value.mark(props.lon,props.lat,props.imgSrc,props.type)
})
watch(
	()=>map.value,
	()=>{
		map.value.mark(props.lon,props.lat,props.imgSrc,props.type)
	}
)
</script>