import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdirSync,writeFileSync} from 'node:fs';
import {Bike,Waves,Clapperboard,CookingPot,Music,Footprints,LibraryBig,ShoppingCart,Palette,Backpack,Car,House,Flower2,Candy,BookOpen,CarTaxiFront,TramFront,Bus,Coffee,KeyRound,Glasses,Smartphone,Sprout,TrainFront} from 'lucide-react';
const icons={bicycle:Bike,swimming:Waves,cinema:Clapperboard,cooking:CookingPot,concert:Music,hiking:Footprints,library:LibraryBig,shopping:ShoppingCart,painting:Palette,backpack:Backpack,car:Car,home:House,flowers:Flower2,chocolate:Candy,book:BookOpen,taxi:CarTaxiFront,tram:TramFront,bus:Bus,cafe:Coffee,keys:KeyRound,glasses:Glasses,phone:Smartphone,plant:Sprout,train:TrainFront};
mkdirSync('public/exam-images',{recursive:true});
for(const [id,icon] of Object.entries(icons))writeFileSync(`public/exam-images/${id}.svg`,renderToStaticMarkup(React.createElement(icon,{width:120,height:100,strokeWidth:1.25,color:'#324c3c'})));
writeFileSync('public/exam-images/water.svg','<svg xmlns="http://www.w3.org/2000/svg" width="120" height="100" viewBox="0 0 120 100"><g fill="none" stroke="#324c3c" stroke-width="3" stroke-linejoin="round"><path d="M48 10h24v12l8 12v50a5 5 0 0 1-5 5H45a5 5 0 0 1-5-5V34l8-12zM48 16h24M40 48h40M40 70h40"/><path d="M60 49c-12 14-13 20 0 20s12-6 0-20z"/></g></svg>');
console.log(`${Object.keys(icons).length+1} original SVG pictogram assets`);
