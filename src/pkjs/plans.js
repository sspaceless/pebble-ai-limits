// Only explicit provider metadata is used; model names and quota size are not plans.
function label(value) {
  if(typeof value!=='string')return '';
  value=value.trim();if(!value||/^(unknown|none|null)$/i.test(value))return '';
  var known={free:'Free',plus:'Plus',pro:'Pro',max:'Max',team:'Team',business:'Business',enterprise:'Enterprise',edu:'Edu',education:'Edu',ultra:'Ultra',standard:'Standard'};
  if(Object.prototype.hasOwnProperty.call(known,value.toLowerCase()))return known[value.toLowerCase()];
  value=value.replace(/^Google AI /i,'').replace(/^Gemini Code Assist /i,'');
  if(!/^[A-Za-z0-9][A-Za-z0-9 .+_()-]{0,47}$/.test(value))return '';
  return value.slice(0,24);
}
function header(provider,plan){var name=label(plan);return name?(provider+' '+name).slice(0,31):provider;}
module.exports={label:label,header:header};
