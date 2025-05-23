export class Action {
    constructor(ctx) {
        this.ctx = ctx;
        this.help = {
            "title": "",
            "text": "",
            "commands": [],
            "parameters": [],
            "author": "",
            "version": "0.1"
        }

        this.nodesTable = {
            "MercuryHUB": "Larunda Relay, Mercury",
            "VenusHUB": "Vesper Relay, Venus",
            "EarthHUB": "Strata Relay, Earth",
            "TradeHUB1": "Maroo's Bazaar, Mars",
            "SaturnHUB": "Kronia Relay, Saturn",
            "ErisHUB": "Kuiper Relay, Eris",
            "EuropaHUB": "Leonov Relay, Europa",
            "PlutoHUB": "Orcus Relay, Pluto",
            "ClanNode0": "Romula, Venus",
            "ClanNode1": "Malva, Venus",
            "ClanNode2": "Coba, Earth",
            "ClanNode3": "Tikal, Earth",
            "ClanNode4": "Sinai, Jupiter",
            "ClanNode5": "Cameria, Jupiter",
            "ClanNode6": "Larzac, Europa",
            "ClanNode7": "Cholistan, Europa",
            "ClanNode8": "Kadesh, Mars",
            "ClanNode9": "Wahiba, Mars",
            "ClanNode10": "Memphis, Phobos",
            "ClanNode11": "Zeugma, Phobos",
            "ClanNode12": "Caracol, Saturn",
            "ClanNode13": "Piscinas, Saturn",
            "ClanNode14": "Amarna, Sedna",
            "ClanNode15": "Sangeru, Sedna",
            "ClanNode16": "Ur, Uranus",
            "ClanNode17": "Assur, Uranus",
            "ClanNode18": "Akkad, Eris",
            "ClanNode19": "Zabala, Eris",
            "ClanNode20": "Yursa, Neptune",
            "ClanNode21": "Kelashin, Neptune",
            "ClanNode22": "Seimeni, Ceres",
            "ClanNode23": "Gabii, Ceres",
            "ClanNode24": "Sechura, Pluto",
            "ClanNode25": "Hieracon, Pluto",
            "SettlementNode1": "Roche, Phobos",
            "SettlementNode2": "Skyresh, Phobos",
            "SettlementNode3": "Stickney, Phobos",
            "SettlementNode10": "Kepler, Phobos",
            "SettlementNode11": "Gulliver, Phobos",
            "SettlementNode12": "Monolith, Phobos",
            "SettlementNode14": "Shklovsky, Phobos",
            "SettlementNode15": "Sharpless, Phobos",
            "SettlementNode20": "Iliad, Phobos",
            "SolNode1": "Galatea, Neptune",
            "SolNode2": "Aphrodite, Venus",
            "SolNode4": "Acheron, Pluto",
            "SolNode6": "Despina, Neptune",
            "SolNode9": "Rosalind, Uranus",
            "SolNode10": "Thebe, Jupiter",
            "SolNode11": "Tharsis, Mars",
            "SolNode12": "Elion, Mercury",
            "SolNode14": "Ultor, Mars",
            "SolNode15": "Pacific, Earth",
            "SolNode16": "Augustus, Mars",
            "SolNode17": "Proteus, Neptune",
            "SolNode18": "Rhea, Saturn",
            "SolNode19": "Enceladus, Saturn",
            "SolNode20": "Telesto, Saturn",
            "SolNode21": "Narcissus, Pluto",
            "SolNode22": "Tessera, Venus",
            "SolNode23": "Cytherean, Venus",
            "SolNode24": "Oro, Earth",
            "SolNode25": "Callisto, Jupiter",
            "SolNode26": "Lith, Earth",
            "SolNode27": "E Prime, Earth",
            "SolNode28": "Terminus, Mercury",
            "SolNode30": "Olympus, Mars",
            "SolNode31": "Anthe, Saturn",
            "SolNode32": "Tethys, Saturn",
            "SolNode33": "Ariel, Uranus",
            "SolNode34": "Sycorax, Uranus",
            "SolNode36": "Martialis, Mars",
            "SolNode38": "Minthe, Pluto",
            "SolNode39": "Everest, Earth",
            "SolNode41": "Arval, Mars",
            "SolNode42": "Helene, Saturn",
            "SolNode43": "Cerberus, Pluto",
            "SolNode45": "Ara, Mars",
            "SolNode46": "Spear, Mars",
            "SolNode48": "Regna, Pluto",
            "SolNode49": "Larissa, Neptune",
            "SolNode50": "Numa, Saturn",
            "SolNode51": "Hades, Pluto",
            "SolNode53": "Themisto, Jupiter",
            "SolNode56": "Cypress, Pluto",
            "SolNode57": "Sao, Neptune",
            "SolNode58": "Hellas, Mars",
            "SolNode59": "Eurasia, Earth",
            "SolNode60": "Caliban, Uranus",
            "SolNode61": "Ishtar, Venus",
            "SolNode62": "Neso, Neptune",
            "SolNode63": "Mantle, Earth",
            "SolNode64": "Umbriel, Uranus",
            "SolNode65": "Gradivus, Mars",
            "SolNode66": "Unda, Venus",
            "SolNode67": "Dione, Saturn",
            "SolNode68": "Vallis, Mars",
            "SolNode69": "Ophelia, Uranus",
            "SolNode70": "Cassini, Saturn",
            "SolNode72": "Outer Terminus, Pluto",
            "SolNode73": "Ananke, Jupiter",
            "SolNode74": "Carme, Jupiter",
            "SolNode75": "Cervantes, Earth",
            "SolNode76": "Hydra, Pluto",
            "SolNode78": "Triton, Neptune",
            "SolNode79": "Cambria, Earth",
            "SolNode81": "Palus, Pluto",
            "SolNode82": "Calypso, Saturn",
            "SolNode83": "Cressida, Uranus",
            "SolNode84": "Nereid, Neptune",
            "SolNode85": "Gaia, Earth",
            "SolNode87": "Ganymede, Jupiter",
            "SolNode88": "Adrastea, Jupiter",
            "SolNode89": "Mariana, Earth",
            "SolNode93": "Keeler, Saturn",
            "SolNode94": "Apollodorus, Mercury",
            "SolNode96": "Titan, Saturn",
            "SolNode97": "Amalthea, Jupiter",
            "SolNode98": "Desdemona, Uranus",
            "SolNode99": "War, Mars",
            "SolNode100": "Elara, Jupiter",
            "SolNode101": "Kiliken, Venus",
            "SolNode102": "Oceanum, Pluto",
            "SolNode103": "M Prime, Mercury",
            "SolNode104": "Fossa, Venus",
            "SolNode105": "Titania, Uranus",
            "SolNode106": "Alator, Mars",
            "SolNode107": "Venera, Venus",
            "SolNode108": "Tolstoj, Mercury",
            "SolNode109": "Linea, Venus",
            "SolNode113": "Ares, Mars",
            "SolNode114": "Puck, Uranus",
            "SolNode118": "Laomedeia, Neptune",
            "SolNode119": "Caloris, Mercury",
            "SolNode121": "Carpo, Jupiter",
            "SolNode122": "Stephano, Uranus",
            "SolNode123": "V Prime, Venus",
            "SolNode125": "Io, Jupiter",
            "SolNode126": "Metis, Jupiter",
            "SolNode127": "Psamathe, Neptune",
            "SolNode128": "E Gate, Venus",
            "SolNode129": "Orb Vallis, Venus",
            "SolNode130": "Lares, Mercury",
            "SolNode131": "Pallas, Ceres",
            "SolNode132": "Bode, Ceres",
            "SolNode135": "Thon, Ceres",
            "SolNode137": "Nuovo, Ceres",
            "SolNode138": "Ludi, Ceres",
            "SolNode139": "Lex, Ceres",
            "SolNode140": "Kiste, Ceres",
            "SolNode141": "Ker, Ceres",
            "SolNode144": "Exta, Ceres",
            "SolNode146": "Draco, Ceres",
            "SolNode147": "Cinxia, Ceres",
            "SolNode149": "Casta, Ceres",
            "SolNode153": "Brugia, Eris",
            "SolNode162": "Isos, Eris",
            "SolNode164": "Kala-azar, Eris",
            "SolNode166": "Nimus, Eris",
            "SolNode167": "Oestrus, Eris",
            "SolNode171": "Saxis, Eris",
            "SolNode172": "Xini, Eris",
            "SolNode173": "Solium, Eris",
            "SolNode175": "Naeglar, Eris",
            "SolNode177": "Kappa, Sedna",
            "SolNode181": "Adaro, Sedna",
            "SolNode183": "Vodyanoi, Sedna",
            "SolNode184": "Rusalka, Sedna",
            "SolNode185": "Berehynia, Sedna",
            "SolNode187": "Selkie, Sedna",
            "SolNode188": "Kelpie, Sedna",
            "SolNode189": "Naga, Sedna",
            "SolNode190": "Nakki, Sedna",
            "SolNode191": "Marid, Sedna",
            "SolNode193": "Merrow, Sedna",
            "SolNode195": "Hydron, Sedna",
            "SolNode196": "Charybdis, Sedna",
            "SolNode199": "Yam, Sedna",
            "SolNode203": "Abaddon, Europa",
            "SolNode204": "Armaros, Europa",
            "SolNode205": "Baal, Europa",
            "SolNode209": "Morax, Europa",
            "SolNode210": "Naamah, Europa",
            "SolNode211": "Ose, Europa",
            "SolNode212": "Paimon, Europa",
            "SolNode214": "Sorath, Europa",
            "SolNode215": "Valac, Europa",
            "SolNode216": "Valefor, Europa",
            "SolNode217": "Orias, Europa",
            "SolNode220": "Kokabiel, Europa",
            "SolNode223": "Boethius, Mercury",
            "SolNode224": "Odin, Mercury",
            "SolNode225": "Suisei, Mercury",
            "SolNode226": "Pantheon, Mercury",
            "SolNode228": "Plains of Eidolon, Earth",
            "SolNode229": "Cambion Drift, Deimos",
            "SolNode300": "Plato, Lua",
            "SolNode301": "Grimaldi, Lua",
            "SolNode302": "Tycho, Lua",
            "SolNode304": "Copernicus, Lua",
            "SolNode305": "Stöfler, Lua",
            "SolNode306": "Pavlov, Lua",
            "SolNode307": "Zeipel, Lua",
            "SolNode308": "Apollo, Lua",
            "SolNode400": "Teshub, Void",
            "SolNode401": "Hepit, Void",
            "SolNode402": "Taranis, Void",
            "SolNode403": "Tiwaz, Void",
            "SolNode404": "Stribog, Void",
            "SolNode405": "Ani, Void",
            "SolNode406": "Ukko, Void",
            "SolNode407": "Oxomoco, Void",
            "SolNode408": "Belenus, Void",
            "SolNode409": "Mot, Void",
            "SolNode410": "Aten, Void",
            "SolNode411": "Marduk, Void",
            "SolNode412": "Mithra, Void",
            "SolNode701": "Jordas Golem Assassinate",
            "SolNode705": "Mutalist Alad V Assassinate",
            "SolNode706": "Horend, Deimos",
            "SolNode707": "Hyf, Deimos",
            "SolNode708": "Phlegyas, Deimos",
            "SolNode709": "Dirus, Deimos",
            "SolNode710": "Formido, Deimos",
            "SolNode711": "Terrorem, Deimos",
            "SolNode712": "Magnacidium, Deimos",
            "SolNode713": "Exequias, Deimos",
            "SolNode740": "The Ropalolyst, Jupiter",
            "SolNode741": "Koro, Kuva Fortress",
            "SolNode742": "Nabuk, Kuva Fortress",
            "SolNode743": "Rotuma, Kuva Fortress",
            "SolNode744": "Taveuni, Kuva Fortress",
            "SolNode745": "Tamu, Kuva Fortress",
            "SolNode746": "Dakata, Kuva Fortress",
            "SolNode747": "Pago, Kuva Fortress",
            "SolNode748": "Garus, Kuva Fortress",
            "SolNode902": "Montes, Venus",
            "SolNode903": "Erpo, Earth",
            "SolNode904": "Syrtis, Mars",
            "SolNode905": "Galilea, Jupiter",
            "SolNode906": "Pandora, Saturn",
            "SolNode907": "Caelus, Uranus",
            "SolNode908": "Salacia, Neptune"
            }
    }
    async getWorldState() {
        const data = await fetch(`https://content.warframe.com/dynamic/worldState.php`);
        const js = await data.json()
        return js;

    }
    async on_execute() {
        const cmd = this.ctx.line[0];
        const params = this.ctx.line.slice(1)
        const line = params.join(" ")

        switch(cmd) {
            case "voidtraders":
            case "vt":
            case "baro":
                const baroState = await this.getWorldState();
                const traders = baroState.VoidTraders;
                let bjs = [];

                for(const trader of traders) {
                    let ats = this.ctx.dayjs(parseInt(trader.Activation["$date"]["$numberLong"]))
                    let uts = this.ctx.dayjs(parseInt(trader.Expiry["$date"]["$numberLong"]))
                    if(!this.ctx.args.json) this.ctx.writeln(`:right_arrow: ${trader.Character} arrives at ${this.nodesTable[trader.Node]} ${ats.fromNow()} and leaves ${uts.fromNow()} from now.`);
                    else bjs.push({
                        "trader": trader.Character,
                        "location": this.nodesTable[trader.Node],
                        "arrives": ats.fromNow(),
                        "leaves": uts.fromNow()
                    })
                }
                if(this.ctx.args.json) console.log(JSON.stringify(bjs))
                break


            case "alerts":
                const ws = await this.getWorldState();

                let mi = {}
                let js = []

                if(ws.Alerts.length == 0) {
                    this.ctx.writeln(`No alerts currently active.`)
                    return;
                }
                for(const al of ws.Alerts){
                    mi = al.MissionInfo;


                    let rw = mi.missionReward;
                    let humanizeRewards = function(l) {
                        let out = [];
                        for(let item of l) {out.push(item.split("/").slice(-1)[0])}
                        return out.join(", ")
                    }


                    let ts = this.ctx.dayjs(parseInt(al.Expiry["$date"]["$numberLong"]))


                    //json output

                    if(this.ctx.args.json) {
                        js.push({
                            "location": this.nodesTable[mi.location],
                            "missionType": mi.missionType,
                            "faction": mi.faction,
                            "difficulty": mi.difficulty,
                            "tag": al.Tag,
                            "rewards": [rw.credits, humanizeRewards(rw.items)].join(", "),
                            "expires": ts.fromNow()

                        })

                    } else {
                        this.ctx.writeln(`:right_arrow: ${this.nodesTable[mi.location]} -> ${mi.missionType} -> ${mi.faction} -> ${mi.difficulty} (${al.Tag})`)
                        this.ctx.writeln(`:loop_arrow: Rewards: c${rw.credits}, ${humanizeRewards(rw.items)}`)
                        this.ctx.writeln(`:loop_arrow: Expires ${ts.fromNow()}`)
                    }

                }

                if(this.ctx.args.json) console.log(JSON.stringify(js))

                break;

            default:
                console.log("Unknown command")
                break;
        }
    }
}
