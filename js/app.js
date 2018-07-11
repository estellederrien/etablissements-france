var app = new Vue({
	el: "#app",
	data() {
		return {
			form: {
				email: '',
				plaque: '',
				marque: null,
				checked: []
			},
			marques: [{
				text: 'Selectionnez',
				value: null
			}, 'Peugeot', 'Renault', 'Citroen', 'Ds'],
			show: true,
			personnes:[]
		}
	},
	pouchdb: {
		vehicules: {
		  localDB: "vehicules",
		  remoteURL: "https://1c54473b-be6e-42d6-b914-d0ecae937981-bluemix:8eeedbe180c1ce90cdc3ae37b9e74af7368b21a37b531aae819929d3405c7d22@1c54473b-be6e-42d6-b914-d0ecae937981-bluemix.cloudant.com/vehicules"
		}
	},
	computed: {
		automobiles() {
		  return this.vehicules.automobiles
		},
		camions() {
		  return this.vehicules.camions
		}
	},
	methods: {
		onSubmit(evt) {
					evt.preventDefault();
					this.ajouterAutomobile(this.form);
				},
		onReset(evt) {
			evt.preventDefault();
			/* Reset our form values */
			this.form.email = ''; 
			this.form.plaque = '';
			this.form.marque = null;
			this.form.checked = [];
			/* Trick to reset/clear native browser form validation state */
			this.show = false;
			this.$nextTick(() => {
				this.show = true
			});
		},
		ajouterAutomobile(form) {
			this.$pouchdbRefs.vehicules.put('automobiles',form)
		},
		addPassenger () {
			this.$pouchdbRefs.vehicules.put('camions', /*your data*/)
		} 
	}
})