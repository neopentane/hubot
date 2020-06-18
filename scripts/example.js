// Description:
//    An example script, tells you the time. See below on how documentation works.
//    https://github.com/hubotio/hubot/blob/master/docs/scripting.md#documenting-scripts
// 
// Commands:
//    bot what time is it? - Tells you the time
//    bot what's the time? - Tells you the time
//
var dbo
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";
MongoClient.connect(url, function (err, db) {
	if (err) throw err;
	console.log("Database created!");
	dbo = db.db("mydb");
	dbo.createCollection("customers", function (err, res) {
		if (err) throw err;
		console.log("Collection created!");
	})
});
module.exports = (robot) => {
	let started = true
	let votes = []
	let emogi = {
		1: ":one:",
		2: ":two:",
		3: ":three:",
		4: ":four:",
		5: ":five:",
		6: ":six:",
		7: ":seven:",
		8: ":eight:",
		9: ":nine:"
	}
	let nos = {
		":one:": 0,
		":two:": 1,
		":three:": 2,
		":four:": 3,
		":five:": 4,
		":six:": 5,
		":seven:": 6,
		":eight:": 7,
		":nine:": 8
	}
	robot.respond(/(test)/gi, (res) => {
		console.log(robot)
		//console.log(res.message.user.roomID)
		//res.send(res.message.user.roomID, res.message.user.id)
		/*
		console.log(robot.router.get)
		robot.router.get('www.google.comm', res => {
			console.log(res)
		})
		//console.log(res)
		//let myobj = { group: res.message.user.roomID, creator: res.message.user.name, creatorId: res.message.user.id };
		let msg = {}
		msg.attachments = [{
			title: "Test",
			text: "sdfsdf",
			image_url: "https://rocket.chat/images/mockup.png",
		}]
		res.send(msg)
		/*dbo.collection("customers").insertOne(myobj, function (err, res) {
			if (err) throw err;
		});*/

	})
	robot.respond(/(start poll)/gi, (res) => {
		dbo.collection("customers").findOne({ group: res.message.user.roomID, creatorId: res.message.user.id }, function (err, result) {
			if (err) throw err;
			if (result) {
				res.send("fninsh previous poll")
			}
			else {
				matchs = res.message.text.match(/[^{\}]+(?=})/g)
				let question = matchs[0]
				let options = []
				let o = ""
				let v = ""
				let r = ""
				let t = []
				let mystr = "Created Poll \n #### " + question + "\n"
				for (let i = 1; i < matchs.length; i++) {
					let r = {
						num: emogi[i],
						option: matchs[i],
						vote: 0
					}
					options.push(r)
					mystr = mystr.concat(emogi[i], "  ", matchs[i], "\n")
				}
				let myobj = { group: res.message.user.roomID, creator: res.message.user.name, creatorId: res.message.user.id, question: question, options: options, voters: [] };
				dbo.collection("customers").insertOne(myobj, function (err, res) {
					if (err) throw err;
				});

				res.send(mystr)
			}
		});
	})
	robot.respond(/(vote)/gi, (res) => {
		dbo.collection("customers").findOne({ group: res.message.user.roomID }, function (err, result) {
			if (result == null) {
				res.send("No poll is running")
			}
			else {
				dbo.collection("customers").findOne({ group: res.message.user.roomID, voters: res.message.user.id }, function (err, result) {
					if (result != null) {
						res.send("already voted")
					}
					else {
						let re = 0
						dbo.collection("customers").findOne({ group: res.message.user.roomID }, function (err, ro) {
							re = ro.options.length - 1
							let vz = res.message.text.split(" ")[2]
							bz = vz
							console.log(re, nos[bz])
							if (nos[bz] != undefined && nos[bz] <= re) {
								vz = nos[vz]
								let query = "options.".concat(vz, ".vote")
								let innerkey = query
								let innerquerry = {}
								innerquerry[innerkey] = 1
								let myquery = {}
								let mykey = "$inc"
								myquery[mykey] = innerquerry
								dbo.collection("customers").update({ group: res.message.user.roomID }, { $push: { voters: res.message.user.id } }, (err, result) => {
									dbo.collection("customers").update({ group: res.message.user.roomID }, myquery);
									res.send("vote noted")
								})
							}
							else {
								res.send("invalid option try again")
							}
						})

					}
				})
			}
		})
	})
	robot.respond(/(end)/gi, (res) => {
		dbo.collection("customers").findOne({ group: res.message.user.roomID, creatorId: res.message.user.id }, (err, result) => {
			if (result != null) {
				let total = 0
				let resp = "|no|option|votes|\n|--|--|--|\n"
				console.log(result.options[0].num)
				for (let i = 0; i < result.options.length; i++) {
					resp = resp.concat("|", result.options[i].num, "|", result.options[i].option, "|", result.options[i].vote, "|\n")
				}
				res.send(resp)
				dbo.collection("customers").remove({ group: res.message.user.roomID, creatorId: res.message.user.id })
			}
		})
	})
	robot.respond(/(standing)/gi, (res) => {
		dbo.collection("customers").findOne({ group: res.message.user.roomID }, (err, result) => {
			if (result != null) {
				let total = 0
				let resp = "|no|option|votes|\n|--|--|--|\n"
				console.log(result.options[0].num)
				for (let i = 0; i < result.options.length; i++) {
					resp = resp.concat("|", result.options[i].num, "|", result.options[i].option, "|", result.options[i].vote, "|\n")
				}
				res.send(resp)
			}
		})
	})
}
