const mongoose = require('mongoose');
const Parent = require('./parent');
const { Schema } = mongoose;

// Declare the Schema of the Mongo model
var studentSchema = new Schema({
    name: {
        firstName: {
            type: String,
            required: [true, 'name cannot be blank']
        },
        lastName: {
            type: String,
            required: [true, 'name cannot be blank']
        },
        koreanName: {
            type: String
            // required: [true, 'name cannot be blank']
        }
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: [true, 'gender cannot be blank']
    },
    birthday: {
        type: Date,
        required: [true, 'Date of birth cannot be blank']
    },
    school: {
        type: String
    },
    kcpcMemberDate: Date,
    medicalInfo: String,
    // {
    //     // disability, diet restrictions, allergies, seizures, special needs, addit. info
    //     notes: {
    //         type: String
    //     },
    // },
    incidents: [
        {
            type: String
        }
    ],
    behavioral: {
        comprehension: {
            english: {
                type: Number
                // default: null
            },
            korean: {
                type: Number
                // default: null
            }
        },
        likes: String,   // likes/attractions/favorite activities/food
        dislikes: String,    // triggers/dislikes/fears
        pacification: String,
        needs: String
    },
    parents: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Parent'
        },
        {
            type: Schema.Types.ObjectId,
            ref: 'Parent'
        }
    ],
    // siblings: [
    //     {
    //         type:String
    //     // type: Schema.Types.ObjectId,
    //     // ref: 'Student'
    //     }
    // ]
    image: {
        url: String,
        filename: String
    }
});
studentSchema.virtual('fullName')
    .get(function() {
        return `${this.name.firstName} ${this.name.lastName}`;
    })
    .set(function(v) {
        this.name.firstName = v.substr(0, v.indexOf(' '));
        this.name.lastName = v.substr(v.indexOf(' ') + 1);
    });
studentSchema.virtual('kcpcMemberDateMDY')
    .get(function() {
        if (this.kcpcMemberDate)
            return ('0' + (this.kcpcMemberDate.getMonth()+1)).slice(-2) + '-' + ('0' + this.kcpcMemberDate.getDate()).slice(-2) + '-' + this.kcpcMemberDate.getFullYear();
        return
    })
studentSchema.virtual('kcpcMemberDateYMD')
    .get(function() {
        if (this.kcpcMemberDate)
            return  this.kcpcMemberDate.getFullYear() + '-' + ('0' + (this.kcpcMemberDate.getMonth()+1)).slice(-2) + '-' + ('0' + this.kcpcMemberDate.getDate()).slice(-2);
    })
studentSchema.virtual('birthdayMDY')
    .get(function() {
        return ('0' + (this.birthday.getMonth()+1)).slice(-2) + '-' + ('0' + this.birthday.getDate()).slice(-2) + '-' + this.birthday.getFullYear();
    })
studentSchema.virtual('birthdayYMD')
    .get(function() {
        return  this.birthday.getFullYear() + '-' + ('0' + (this.birthday.getMonth()+1)).slice(-2) + '-' + ('0' + this.birthday.getDate()).slice(-2);
    })

studentSchema.virtual('phoneNumber')
    .get(function() {
        const cleaned = ('' + this.phone).replace(/\D/g, '')
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
        return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    })
    // .set(function(v) {
    //     this.name.firstName = v.substr(0, v.indexOf(' '));
    //     this.name.lastName = v.substr(v.indexOf(' ') + 1);
    // });
studentSchema.virtual('comprehensionEng')
    .get(function() {
        return this.behavioral.comprehension.english;
    })
studentSchema.virtual('comprehensionKor')
    .get(function() {
        return this.behavioral.comprehension.korean;
    })


studentSchema.post('findOneAndDelete', async function(student) {
    // console.log('POST-DELETE!!');
    // Deletes Parent(s) if the Student deleted
    // TODO: But what if a Parent has multiple Students?
    if (student.parents.length != 0) {
        await Parent.deleteMany({ _id: {$in: student.parents} })
    }
})

// studentSchema.pre('findOneAndUpdate', async function(student) {
    // console.log(student);
//     console.log('PRE-UPDATE!!');
//     student.depopulate('parents');
//     console.log(student);
// })
// studentSchema.post('findOneAndUpdate', async function(student) {
//     console.log('POST-UPDATE!!');
// })

// studentSchema.pre('save', async function() {
//     console.log('ABOUT TO SAVE!!');
//     console.log(this);
// })

//Export the model
const Student = mongoose.model('Student', studentSchema);
const x = async () => await Student.syncIndexes() ;
module.exports = Student;
