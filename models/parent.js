const mongoose = require('mongoose');
const { login } = require('../controllers/users');
const { Schema } = mongoose;

// const statesArray = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const statesArray = ["VA", "MD", "DC"];
const relationsArray = ["Mother", "Father", "Aunt", "Uncle", "Grandmother", "Grandfather"]
// Declare the Schema of the Mongo model
var parentSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name cannot be blank']
        // firstName: {
        //     type: String,
        //     required: [true, 'name cannot be blank']
        // },
        // lastName: {
        //     type: String,
        //     required: [true, 'name cannot be blank']
        // },
        // koreanName: {
        //     type: String
            // required: [true, 'name cannot be blank']
        // }
    },
    address: {
        street: String,
        city: {
            type: String,
            // required: true
        },
        state: {
            type: String,
            uppercase: true,
            enum: statesArray,
            // required: true
        },
        zip: {
            type: String,
            // minlength: 5, 
            maxlength: 5,
            // required: true
        }
    },
    email: {
        type: String,
        // required: [true, 'email cannot be blank'],
        // unique: true,
    },
    phone: {
        type: String,
        // required: [true, 'phone cannot be blank'],
        // unique: true
        // validate: {
        //     validator: function(v) {
        //       return /\d{3}-\d{3}-\d{4}/.test(v);
        //     },
        //     message: props => `${props.value} is not a valid phone number!`
        //   },
    },
    kcpcMember: {
        type: Boolean,
        default: false
    },
    relation: {
        toStudent: {
            type: String,
            enum: relationsArray,
            required: [true, 'relationship cannot be blank']
        },
        marriageStatus: {
            type: String,
            enum: ["married", "divorced"]
        }
    },
    notes: {
        type: String
    }
    // // TODO: choice to add multiple students/children
    // student: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Parent'
    // }
});

// parentSchema.virtual('fullName')
//     .get(function() {
//         console.log('hello');
//         return this.name.firstName + ' ' + this.name.lastName;
//     })
//     .set(function(v) {
//         this.name.firstName = v.substr(0, v.indexOf(' '));
//         this.name.lastName = v.substr(v.indexOf(' ') + 1);
//     });

parentSchema.virtual('addressFull')
    .get(function() {
        if ('address' in this && this.address.street && this.address.city && this.address.state) {
            return `${this.address.street}, ${this.address.city}, ${this.address.state}`;
        }
        return '';
    })

// parentSchema.virtual('phoneNumber')
//     .get(function() {
//         const cleaned = ('' + this.phone).replace(/\D/g, '')
//         const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
//         return '(' + match[1] + ') ' + match[2] + '-' + match[3]
//     })
    // .set(function(v) {
    //     this.name.firstName = v.substr(0, v.indexOf(' '));
    //     this.name.lastName = v.substr(v.indexOf(' ') + 1);
    // });

//Export the model
const Parent = mongoose.model('Parent', parentSchema);

const x = async () => await Parent.syncIndexes();
module.exports.Parent = Parent;
module.exports.statesArray = statesArray;
module.exports.relationsArray = relationsArray;
