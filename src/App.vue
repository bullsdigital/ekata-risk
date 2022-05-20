<template>
  <div id="app">
    <div class="container mx-auto">

      <h1 class="my-16 text-5xl text-center">Transaction Risk Scoring</h1>
      
      <vue-csv-import v-model="users" :fields="userFields">
        <vue-csv-errors></vue-csv-errors>
        <div class="grid grid-cols-3 gap-4">
          <div class="mx-auto">
            <h3 class="text-center text-xl mb-3 font-semibold uppercase">Step 1: Upload CSV</h3>
            <vue-csv-input name="fileUpload" id="fileUpload" class="input-file input-file--hidden"></vue-csv-input>
            <label for="fileUpload" class="bg-red-700 text-white font-bold hover:bg-black w-64 px-8 py-4 text-center">Upload Users</label>

            <div class="text-center mt-4">
              <vue-csv-toggle-headers></vue-csv-toggle-headers>
              <vue-csv-map class="mt-4 mx-auto"></vue-csv-map>
            </div>

            <p class="mt-6 text-center">You have <strong>{{users.length}}</strong> contacts loaded</p>
          </div>
          <div v-if="users.length" class="mx-auto">
            <h3 class="text-center text-xl mb-3 font-semibold uppercase">Step 2: Run Risk Score</h3>
            <button @click="getRiskScore()" class="bg-red-700 hover:bg-black w-64 px-8 py-4 font-bold text-white">Run Risk Score</button>
          </div>
          <div v-if="risks.length" class="mx-auto">
            <h3 class="text-center text-xl mb-3 font-semibold uppercase">Step 3: Export Risk Scores</h3>
            <vue-excel-xlsx
              :data="risks"
              :columns="json_columns"
              :file-name="'contact-risk-score-export'"
              :file-type="'xlsx'"
              :sheet-name="'risks'"
              >
                <button class="bg-red-700 hover:bg-black w-64 px-8 py-4 font-bold text-white">Export to CSV</button>
            </vue-excel-xlsx>
          </div>
        </div>
      </vue-csv-import>

      

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 my-24">     

        <div v-for="user in risks" :key="user.id" class="bg-white p-8 border-t-4 border-gray-500 shadow-md">
          <h4 class="text-xl font-semibold">{{user.firstName}}  {{user.lastName}}</h4>
          <p>{{user.address1}}</p>
          <p>{{user.address2}}</p>
          <p>{{user.city}}, {{user.state}} {{user.zip}}</p>
          <p>{{user.email}}</p>
          <p>{{user.phone}}</p>
          <p>{{user.ip}}</p>

          <div class="score p-3 mt-4 bg-green-100 text-center" :class="[user.riskData.transaction_risk_score < 200 ? 'bg-green-100' : user.riskData.transaction_risk_score > 200 && user.riskData.transaction_risk_score < 400 ? 'bg-yellow-100' : 'bg-red-100']">
            <p class="font-bold text-sm">ID Score</p>
            <p class="mt-2 text-3xl font-semibold">{{user.riskData.transaction_risk_score}}</p>
          </div>

          <div class="py-4 text-sm">
            <p><strong>Phone Subscriber Match?:</strong> {{user.riskData['primary.phone.to_name']}}</p>
            <p><strong>Phone Type:</strong> {{user.riskData['primary.phone.line_type']}}</p>
            <p><strong>Address Match Name?:</strong> {{user.riskData['primary.address.to_name']}}</p>
            <p><strong>Address Type:</strong> {{user.riskData['primary.address.validity_level']}}</p>
            <p><strong>Email domain first seen online (year):</strong> {{user.riskData['primary.email.first_seen_days']}}</p>
            <!-- <pre>{{user.riskData}}</pre> -->
          </div>

        </div>        

      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  components: {},
  data() {
    return {
      users: [],
      userFields: {
          firstName: {required: true, label: "First Name"},
          lastName: {required: true, label: "Last Name"},
          address1: {required: false, label: "Address 1"},
          address2: {required: false, label: "Address 2"},
          city: {required: false, label: "City"},
          state: {required: false, label: "State"},
          zip: {required: true, label: "Zip Code"},
          email: {required: true, label: "Email Address"},
          phone: {required: true, label: "Phone Number"},
          ip: {required: false, label: "IP Address"},
      },
      risks: [],
      errorMsg: '',
      json_columns: [
          {
              label: "First Name",
              field: "firstName",
          },
          {
              label: "Last Name",
              field: "lastName",
          },
          {
              label: "Email Address",
              field: "email",
          },
          {
              label: "Address",
              field: "address1",
          },
          {
              label: "Address 2",
              field: "address2",
          },
          {
              label: "City",
              field: "city",
          },
          {
              label: "State",
              field: "state",
          },
          {
              label: "Zip Code",
              field: "zip",
          },
          {
              label: "Phone Number",
              field: "phone",
          },
          {
              label: "IP Address",
              field: "ip",
          },
          {
              label: "ID Score",
              field: "ipScore",
          },
          {
              label: "Phone Subscriber Match?",
              field: "phoneSubMatch",
          },
          {
              label: "Phone Type",
              field: "phoneType",
          },
          {
              label: "Phone Valid?",
              field: "phoneValid",
          },
          {
              label: "Address Match Name?",
              field: "addressMatchName",
          },
          {
              label: "Address Type",
              field: "addressType",
          },
          {
              label: "Email Domain First Seen Online (year)",
              field: "emailFirstSeen",
          },
          {
              label: "Email Valid",
              field: "emailValid",
          },
          {
              label: "Email Match Name?",
              field: "emailMatchName",
          },
          {
              label: "IP Risk",
              field: "ipRisk",
          },
          {
              label: "Identity Network Score",
              field: "identityNetworkScore",
          },
      ],
    }
  },
  methods: {
    getRiskScore() {

      //const apiKey = process.env.VUE_APP_API_KEY;
      const apiKey = 'a0897a6e8bd34877a677a60f425e518a';

      this.users.forEach((user) => {

        let Name = user.firstName + ' ' + user.lastName
        let FirstName = user.firstName
        let LastName = user.lastName
        let Phone = user.phone
        let Email = user.email
        let Address1 = user.address1
        let Address2 = user.address2
        let City = user.city
        let State = user.state
        let Zip = user.zip
        let IP = user.ip

      axios.get('https://api.ekata.com/1.0/transaction_risk', {
          params: {
            'api_key': apiKey,
            'primary.name': Name,
            'primary.phone': Phone,
            'primary.email_address': Email,  
            'primary.address.street_line_1': Address1,  
            'primary.address.street_line_2': Address2,  
            'primary.address.city': City,  
            'primary.address.state_code': State,  
            'primary.address.postal_code': Zip,  
            'ip_address': IP
          }
        })
        .then((response) => {
            //console.log(response.data)
            //console.log(Name)
            //console.log(response.data.transaction_risk_score)

            this.risks.push({
              firstName: FirstName,
              lastName: LastName,
              address1: Address1,
              address2: Address2,
              city: City,
              state: State,
              zip: Zip,
              phone: Phone,
              email: Email,
              ip: IP,
              ipScore: response.data['transaction_risk_score'],
              phoneSubMatch: response.data['primary.phone.to_name'],
              phoneType: response.data['primary.phone.line_type'],
              phoneValid: response.data['primary.phone.valid'],
              addressMatchName: response.data['primary.address.to_name'],
              addressType: response.data['primary.address.validity_level'],
              emailFirstSeen: response.data['primary.email.first_seen_days'],
              emailValid: response.data['primary.email.valid'],
              emailMatchName: response.data['primary.email.to_name'],
              ipRisk: response.data['ip.risk'],
              identityNetworkScore: response.data['identity_network_score'],
              riskData: response.data
            })

            //console.log(this.risks)
            
        })
        .catch((error) => {
            console.log(error)
            this.errorMsg = 'Error retrieving data'
        })

      })
    }


  }
}
</script>

<style>
/* Style input file */
.input-file--hidden {
  /* hide the input but keep it in the dom for screenreader */
	width: 0.1px;
	height: 0.1px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	z-index: -1;
}

.input-file + label {
  margin-left: 50%;
  transform: translateX(-50%);
  display: inline-block;
}

.input-file:focus + label,
.input-file + label:hover {
    cursor: pointer;
}
/* end input stlyes */
</style>