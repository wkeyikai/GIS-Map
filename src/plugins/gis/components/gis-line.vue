<template>
</template>
<script setup>
import { onMounted } from 'vue';
// import gis from '../lib/gis.js'

const props = defineProps({
	path: {
		type: Array,
		default: []
	},
	color: {
		type: String,
		default: ''
	}
})
const map = inject('map')

onMounted(()=>{
	// map.line(props.path,props.color)
})

watch(
	()=>map.value,
	()=>{
		console.log('props.path',props.path)
		map.value.line({...props})
	}
)
</script>