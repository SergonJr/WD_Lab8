const express = require('express');
const uuidv4 = require("uuid/v4");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('morgan');
const app = express();
const bookToken = "2abbf7c3-245b-404f-9473-ade729ed4653";
const {Bookms} = require('./models/bookmarkModel');

const jsonParser = bodyParser.json();

app.use(express.static("public"));
app.use( morgan('dev') );

function validate(req, res, next)
{
    
    let bookToken = req.headers.bookapikey;
    let authbookToken = req.headers.authorization;
    let bookTokenP = req.query.apikey;
    let apikey = false;
    let bearer = false;
    let param = false;

    if(bookToken === bookToken)
    {
        apikey = true;
    }
    else if (bookTokenP === bookToken)
    {
        param = true;
    }
    else if(authbookToken === `Bearer ${bookToken}`)
    {
        bearer = true;
    }
    else 
    {
        res.statusMessage = "The 'authorization' bookToken is invalid.";
        return res.status( 401 ).end();
    }

    next();
}

app.use( validate );

let bookmarks = [
    {
        id : uuidv4(),
        title : "This book loves you",
        description : "This Book Loves You by PewDiePie is a collection of beautifully illustrated inspirational sayings by which you should live your life. If you follow each and every one, your life will become easier, more fabulous, more rewarding.",
        url : "https://www.goodreads.com/book/show/25711621-this-book-loves-you",
        rating : 3.86
    },
    {
        id : uuidv4(),
        title : "Thrawn",
        description : "One of the most cunning and ruthless warriors in the history of the Galactic Empire, Grand Admiral Thrawn is also one of the most captivating characters in the Star Wars universe, from his introduction in bestselling author Timothy Zahns classic Heir to the Empire through his continuing adventures in Dark Force Rising, The Last Command, and beyond.",
        url : "https://www.goodreads.com/book/show/31140332-thrawn",
        rating : 4.27
    }
];

app.get( '/bookmarks', ( req, res ) => {

    console.log("Getting all bookmarks.");
    
    Bookms
        .getAllBookms()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(e => {
            res.statusMessage = "Something is wrong with the  Database. Try again later.";
            return res.status(500).end();
        });
});

app.get( '/bookmark', ( req, res ) => {

    console.log("Getting a bookmark by title");
    console.log(req.query);

    let title = req.query.title;

    if ( !title )
    {
        res.statusMessage = "Please send the title as parameter";
        return res.status( 406 ).end();
    }

    let result = bookmarks.find( ( bookmark ) => {
        if( bookmark.title === String(title)){
            return bookmark;
        }
    });

    if( !result )
    {
        res.statusMessage = "This title was not found";
        return res.status( 404 ).end();
    }

    return res.status( 200 ).json(result);
});

app.post( '/bookmarks', jsonParser, ( req, res ) =>{
    console.log("Adding a new boookmark to the list.");
    console.log("Body", req.body);

    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let rating = req.body.rating;

    if( !title || !description || !url || !rating )
    {
        res.statusMessage = "Please send all the fields";
        return res.status( 406 ).end();
    }

    let id = uuidv4();

    let newBookm = {id, title, description, url, rating};
    
    Bookms
        .createBookm(newBookm)
        .then(result => {
            //Handle id duplicate error
            if (result.errmsg)
            {
                res.statusMessage = "The 'id' belongs to another bookmark. " +
                                    result.errmsg;
                return res.status(409).end();
            }
            return res.status(201).json(result);
        })
        .catch(e => {
            res.statusMessage = "Something is wrong with the Database. Try again later. " +
                e.message;
            return res.status(500).end();
        })
});

app.delete('/bookmark/:id', (req, res) =>{

    let id = req.params.id;

    console.log(id);

    if( !id )
    {
        res.statusMessage = "Please send the 'id' to delete a bookmark";
        return res.status( 406 ).end();
    }

    let itemToRemove = bookmarks.findIndex( ( bookmark ) => {
        if( bookmark.id === Number(id) )
        {
            return true;
        }
    });

    if( itemToRemove < 0 ){
        res.statusMessage = "That 'id' was not found in the list of students.";
        return res.status( 404 ).end();
    }

    bookmarks.splice( itemToRemove, 1 );
    return res.status( 200 ).end();
});

app.patch('/bookmark/:id', jsonParser, (req, res ) => {
    
    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let rating = req.body.rating;
    let id = req.params.id;
    if( !id )
    {
        res.statusMessage = "Please send the 'id'";
        return res.status( 406 ).end();
    }

    let result = bookmarks.find( (bookmark) => {
        if(bookmark.id === id)
        {
            return bookmark;
        }
    });

    if( !result )
    {
        res.statusMessage = "There is no bookmark with the id passed";
        return res.status( 409 ).end();
    }

    if(title)
    {
        result.title = title
    }

    if(description)
    {
        result.description = description;
    }

    if(url)
    {
        result.url = url;
    }

    if(rating)
    {
        result.rating = rating;
    }

    return res.status( 202 ).json(result);
})

app.listen( 8023, () => {
    console.log( 'This server is running on port 8023' );

    const settings = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    };

    new Promise((resolve, reject) => {
        mongoose.connect('mongodb://localhost/bookmarksdb', settings, (e) => {
            if (e)
            {
                reject(e);
            }
            else
            {
                console.log("Database connected successfully.");
                return resolve();
            }
        })
    })
    .catch(e => {
        mongoose.disconnect();
        console.log(e);
    });
});
