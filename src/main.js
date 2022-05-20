import { createApp } from 'vue'
import App from './App.vue'
import { VueCsvImportPlugin } from "vue-csv-import";
import VueExcelXlsx from "vue-excel-xlsx";
import './assets/tailwind.css'

createApp(App).use(VueCsvImportPlugin).use(VueExcelXlsx).mount("#app");
