var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var cors        = require('cors');
var mongoose    = require('mongoose');
var SearchTerm  = require('./models/searchTerm');
var api         = require('gettyimages-api');

app.set('view engine', 'ejs');

//mongoose.connect('mongodb://localhost/searchTerm');
mongoose.connect('mongodb://ivilinchuk:igorito@ds145380.mlab.com:45380/image_search_abstraction_layer');


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//INDEX route
app.get('/', (req, res)=>{
    res.render('index');
});

//CREATE route
app.post('/new', function(req,res){
      res.redirect('/api/imagesearch/'+req.body.userQuery);
});

//Get call with required and not required parameters to submit a search
app.get('/api/imagesearch/:searchVal*', (req, res)=>{
    var searchVal = req.params.searchVal;
    var offset = req.query.offset;
    
    //API JSON response
    
    var creds = {   apiKey: "vz94a54hd7cwtpjucyw369fu", 
                    apiSecret: "c2jp3uA5pthbZ9FQmdVW99wwwWWQ3m2KbY8TxvFqNGVZd", 
                    username: "Villian79", 
                    password: "i#oRV123$%" 
                };
    var client = new api(creds);
    client.search().images().withPage(offset).withPageSize(10).withPhrase(searchVal).execute(function(err, response) {
        if (err) throw err;
        //var result = JSON.stringify(response);
        var data = response.images;
        var result = [];
        data.forEach(function(e){
            result.push({
                url: 'http://gty.im/'+e['id'],
                snippet: e['title'],
                thumbnail: e['display_sizes'][0]['uri'],
                embedUrl: 'http://embed.gettyimages.com/oembed?url=http://gty.im/'+e['id']
            });
        });
        res.json(result);
        //If you want to visualize search results - comment line 54 and uncomment line 56
        //res.render('results', {result: result});
    });
    
    SearchTerm.create({
        searchVal: searchVal,
        searchDate: new Date
    }, (err, newlyCreated)=>{
        if(err){console.log('Error creating a DB entry: ' + err)}
        else{
            console.log(newlyCreated);
        }
    }
);
});


//Get call to see recent searches
app.get('/api/recentsearches', function(req, res){
    SearchTerm.find({}, function(err, data){
        if(err) throw err;
        res.json(data);
    });
});


app.listen(process.env.PORT, process.env.IP, ()=>{
    console.log('Server is listening to PORT: ' + process.env.PORT);
});