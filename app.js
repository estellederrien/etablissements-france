/* Plugger pouchDb à Cloudant */
var db = new PouchDB('https://1c54473b-be6e-42d6-b914-d0ecae937981-bluemix:8eeedbe180c1ce90cdc3ae37b9e74af7368b21a37b531aae819929d3405c7d22@1c54473b-be6e-42d6-b914-d0ecae937981-bluemix.cloudant.com/etablissements');

/* le Loader Ajax */
$("#loader").hide();

/* Pas de stats au debut */
$("#stats").hide();



function mapReduce(){
	

	db.query('commune/map1', {reduce: true, group: true}).then(function (results) {
		
		$("#liste").empty(); // On vide le précédent formulaire.
		
		keys = [];
		values = []; 
		
		// On crée une ligne pour chaque résultat retourné
		for (x = 0; x < results.rows.length; x++) {
			if(results.rows[x].key != null){
				$("#liste").append("<span ><Label> <b>"  + results.rows[x].key +   "</b></label><br> Quantité: " + results.rows[x].value + " établissements</span><br><br>");
			}
			
			/* Pour le graphique ensuite, on remplit les keys et les valeurs */
			keys.push(results.rows[x].key );
			values.push(results.rows[x].value);
		}
		
		/* on génére le graphique de statistiques en barres */
		genererGraphique(keys,values);
		
		/* Pas de stats au debut */
		$("#stats").show();

	 
	}).catch(function (err) {
		console.log(err);
	  // some error
	});

}

function trouver() {
	$("#loader").show();
	var departement = $("#dep").val();
	var type_detablissement = $("#type_detablissement").val();
	if (departement.length < 3) {
		departementMin = parseInt(departement + '000');
		departementMax = parseInt(departement + '999');
	} else {
		departementMin = parseInt(departement + '00');
		departementMax = parseInt(departement + '99');
	}
	db.createIndex({
		index: {
			fields: ['cp']
		}
	});
	db.createIndex({
		index: {
			fields: ['type_detablissement']
		}
	});
	filtres = {};
	if (departement) {
		filtres.cp = {
			$gt: departementMin,
			$lt: departementMax
		};
	}
	if (type_detablissement) {
		filtres.type_detablissement = type_detablissement;
	}
	db.find({
		"selector": filtres,
		"sort": [{
			"cp": "asc"
		}]
	}).then(function(result) {
		// handle result
		console.log(result.docs);
		$("#liste").empty(); // On vide le précédent formulaire.
		// On crée un boutton pour chaque document
		for (x = 0; x < result.docs.length; x++) {
			var _id = result.docs[x]._id;
			$("#liste").append("<div><button onclick=' editer(\"" + _id + "\")' > Edition</button>  " + result.docs[x].cp + " " + result.docs[x].nom + "<br></div>");
		}
		$("#etabHeader").empty();
		$("#etabHeader").append(result.docs.length);
		$("#loader").hide();
		ajouterMarkers(result.docs);
	}).catch(function(err) {
		console.log(err);
	});
}

/* On ajoute les markers sur la carte */
function ajouterMarkers(docs) {
	$("#map").googleMap();
	for (x = 0; x < docs.length; x++) {
		$("#map").addMarker({
			coords: [docs[x].latitude_y, docs[x].longitude_x], // GPS coords
			title: docs[x].nom, // Title
			text: "<span  onclick=' editer(\"" + docs[x]._id + "\")' > Edition</span>"
		});
	}
}
// EDITER - UPDATE
function editer(id) {
	$("#loader").show();
	// On lit le document sur la base de données à partir de son ID, puis on crée le formulaire en conséquence.
	db.get(id).then(function(doc) {
		window.doc_origin = doc; // On copie le doc original en mémoire parce que on ne veut pas mettre tous les champs dans le forumalire html il y en a trop.
		creerFormulaire(doc);
		$("#loader").hide();
	});
}
// VALIDER UN UPDATE ET ENVOYER LE DOCUMENT SUR IBM CLOUDANT
function valider() {
	$("#loader").show();
	// On récupère les var dans les champs du formulaire
	var formulaire = $('form').serializeArray();
	// On convertit ça en objet JSON
	var etablissementObject = {};
	$.each(formulaire,
		function(i, v) {
			etablissementObject[v.name] = v.value;
		});
	etablissementObject.cp = Number(etablissementObject.cp)
	/* ON réinjecte les données qui ont été modifiées dans le document original. */
	definitiveEtablissement = Object.assign(window.doc_origin, etablissementObject);
	db.put(definitiveEtablissement).then(function(response) {
		// handle response
		alert('bien update');
		$("#loader").hide();
	}).catch(function(err) {
		console.log(err);
	});
}

function creerFormulaire(mesDatas) {
	$("#detail").empty(); // On vide le précédent formulaire.
	// On crée le template formulaire avec  template en JS ES6, c'est très pratique .
	var str = `
				<form id="form" >
					<h3 style ="background:grey;color:white">❤ ${mesDatas.nom}</h3><br>
					<div class="form-group row">
					  <label for="example-text-input">Identifiant Cloudant</label>
					
						<input class="form-control" value="${mesDatas._id}"  name="_id" id="_id" readonly ></input>
					  
					  </div>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">Révision Cloudant</label>
						<input class="form-control" value="${mesDatas._rev}"  name="_rev" id="_rev" readonly ></input>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">code_uai</label>
						<input class="form-control" value="${mesDatas.code_uai}"  name="code_uai" id="code_uai"  ></input>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">n_siret</label>
						<input class="form-control" value="${mesDatas.n_siret}"  name="n_siret" id="n_siret"  ></input>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">type_detablissement</label>
						<input class="form-control" value="${mesDatas.type_detablissement}"  name="type_detablissement" id="type_detablissement"  ></input>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">sigle</label>
						<input class="form-control" value="${mesDatas.sigle}"  name="sigle" id="sigle"  ></input>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">statut</label>
						<input class="form-control" value="${mesDatas.statut}"  name="statut" id="statut"  ></input>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">tutelle</label>
						<input class="form-control" value="${mesDatas.tutelle}"  name="tutelle" id="tutelle"  ></input>
					</div>
					<div class="form-group row">
					  <label for="example-text-input">universite</label>
						<input class="form-control" value="${mesDatas.universite}"  name="universite" id="universite"  ></input>
					</div>
					
					<div class="form-group row">
					  <label for="example-text-input">Nom</label>
					
						<input class="form-control" value="${mesDatas.nom}"  name="nom" id="nom"></input>
					  </div>
					
					<div class="form-group row">
					  <label for="example-text-input">Adresse</label>
					
						<input class="form-control" value="${mesDatas.adresse}"  name="adresse" id="adresse"></input>
					 
					</div>
					<div class="form-group row">
					  <label for="example-text-input">Cp</label>
					
						<input class="form-control" type = "number" value="${mesDatas.cp}"  name="cp" id="cp"></input>
					  
					</div>
					<div class="form-group row">
					  <label for="example-text-input">commune</label>
					
						<input class="form-control" value="${mesDatas.commune}"  name="commune" id="commune"></input>
					  
					</div>
				
					<div class="form-group row">
					  <label for="example-text-input">Téléphone</label>
					
						<input class="form-control" value="${mesDatas.telephone}"  name="telephone" id="telephone"></input>
					  
					</div>
					<div class="form-group row">
					  <label for="example-text-input">Type</label>
					
						<input class="form-control" value="${mesDatas.type_detablissement}"  name="type_detablissement" id="type_detablissement"></input>
					  
					</div>
					
				 </form>
			`;
	$("#detail").append(str);
}


function genererGraphique(keys,values){
	
	var ctx = document.getElementById('myChart').getContext('2d');
	
	var chart = new Chart(ctx, {
		// The type of chart we want to create
		  type: 'bar',

		// The data for our dataset
		data: {
			labels:keys,
			datasets: [{
				label: "Nombre d'établissements",
				backgroundColor:  getRandomColor(),
				borderColor: 'rgb(255, 99, 132)',
				data: values,
			}]
		},

		// Configuration options go here
		options: {}
	});
	
	
	
}

/* Pour la couleur des bars */
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// On instantie une premiere carte
$(function() {
	$("#map").googleMap({
		zoom: 10, // Initial zoom level (optional)
		coords: [48.895651, 2.290569], // Map center (optional)
		type: "ROADMAP" // Map type (optional)
	});
})



    $('#trouver').tooltip({
        position: {
                 
			using: function( position, feedback ) {
			  $( this ).css( position );
			  $( "<div>" )
				.addClass( "arrow" )
				.addClass( feedback.vertical )
				.addClass( feedback.horizontal )
				.appendTo( this );
			}
        },
        content: function () {
            return "Attention , si vous ne filtrez pas, l'attente est plus longue</b>";
        }
    });

/* INFOS SUR LA BASE DE DONNEE FACULTATIVE */
db.info().then(function(info) {
	console.log(info);
})