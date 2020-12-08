const mongoose = require('mongoose');
const Student = require('../models/student');
const {Parent} = require('../models/parent');

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/yedarm', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

const clearDB = async () => {
    await Student.deleteMany({});
    await Parent.deleteMany({});
};

firstNames = ["Shooter", "Chubbs", "Happy", "Virginia", "Albert", "Steve", "Elton", "Amy", "Reese", "Zooey", "Veronica", "Angelina", "Brad", "Kevin", "Adam", "Joe", "Marshall", "Kevin", "Robert", "John", "Michael", "Moe", "Homer", "Bart", "Lisa", "Marge", "Seymour", "Peter", "Eric", "Stan", "Randy", "Tré"]
lastNames = ["McGavin", "Peterson", "Gilmore", "Venit", "Ki", "Perry", "John", "Adams", "Witherspoon", "Deschanel", "Mars", "Jolie", "Pitt", "James", "Sandler", "Pesci", "Mathers", "Spacey", "DeNiro", "Smith", "Scott", "Szyslak", "Simpson", "Simpson", "Simpson", "Simpson", "Skinner", "Griffin", "Cartman", "Marsh", "Marsh", "Cool"]
emails = ["mcgavin@fake.com", "peterson@fake.com", "gilmore@fake.com", "venit@fake.com", "ki@fake.com", "perry@fake.com", "john@fake.com", "adams@fake.com", "witherspoon@fake.com", "deschanel@fake.com", "mars@fake.com", "jolie@fake.com", "pitt@fake.com", "james@fake.com", "sandler@fake.com", "pesci@fake.com", "mathers@fake.com", "spacey@fake.com", "deniro@fake.com", "smith@fake.com", "scott@fake.com", "szyslak@fake.com", "simpson@fake.com", "simpson2@fake.com", "simpson3@fake.com", "simpson4@fake.com", "skinner@fake.com", "griffin@fake.com", "cartman@fake.com", "marsh@fake.com", "marsh2@fake.com", "cool@fake.com"]

const seedDB = async () => {
    await clearDB();
    for (let i in firstNames) {
        // let randomPhone = Math.floor(Math.random() * 10000000000);
        // while ((Math.log(randomPhone) * Math.LOG10E + 1 | 0) != 10) {
        //     randomPhone = Math.floor(Math.random() * 10000000000);
        // };  // for positive integers
        await Student.create({
            name: {
                firstName: firstNames[i],
                lastName: lastNames[i]
            },
            birthday: `1998-${Math.floor(Math.random() * (12 - 1) + 1)}-${Math.floor(Math.random() * (30 - 1) + 1)}`,
            gender: 'female'
            // image: {
            //     url: 'https://res.cloudinary.com/de7x3ykky/image/upload/v1606248604/yedarm/gosl69xv9desxjmmqqoz.jpg',
            //     filename: 'yedarm/gosl69xv9desxjmmqqoz'
            // }
            // ,image: "https://source.unsplash.com/600x400/?animals"
        })
    }
    let randomPhone = Math.floor(Math.random() * 10000000000);
    while ((Math.log(randomPhone) * Math.LOG10E + 1 | 0) != 10) {
        randomPhone = Math.floor(Math.random() * 10000000000);
    };  // for positive integers

    const parent1 = await Parent.create({
        name: 'Diana Kim',
        birthday: `1948-${Math.floor(Math.random() * (12 - 1) + 1)}-${Math.floor(Math.random() * (30 - 1) + 1)}`,
        email: emails[0],
        phone: "111-222-2222",
        address: {
            street: "124 Main St",
            city: "Fairfax",
            state: "VA",
            zip: 20120
        }
    })
    const parent2 = await Parent.create({
        name: 'Dong Kim',
        birthday: `1938-${Math.floor(Math.random() * (12 - 1) + 1)}-${Math.floor(Math.random() * (30 - 1) + 1)}`,
        email: emails[3],
        phone: "123-444-5967",
        address: {
            street: "124 Main St",
            city: "Fairfax",
            state: "VA",
            zip: 20120
        }
    })
    await Student.create({
        name: {
            firstName: 'Albert',
            lastName: 'Kim'
        },
        birthday: `1998-${Math.floor(Math.random() * (12 - 1) + 1)}-${Math.floor(Math.random() * (30 - 1) + 1)}`,
        gender: 'male',
        school: 'Centerville High',
        parents: [parent1._id, parent2._id]
        // image: {
        //     url: 'https://res.cloudinary.com/de7x3ykky/image/upload/v1606248604/yedarm/gosl69xv9desxjmmqqoz.jpg',
        //     filename: 'yedarm/gosl69xv9desxjmmqqoz'
        // }
        // ,image: "https://source.unsplash.com/600x400/?animals"
    })
}
seedDB().then(() => {
    console.log('DB SUCCESSFULLY SEEDED');
    mongoose.connection.close();
})