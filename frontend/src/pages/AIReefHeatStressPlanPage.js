import React, { useState } from 'react';
import ReadableAIReport from '../components/AIResultView';
import useNativeAIRequest from '../components/useNativeAIRequest';
import NativeAIControls from '../components/NativeAIControls';
import { reefHeatStressPlan } from '../services/api';
const fields=[["reef_site","Reef site","text"],["degree_heating_weeks","Degree heating weeks","number"],["temp_anomaly_c","Temperature anomaly (C)","number"],["recent_bleaching_pct","Recent bleaching (%)","number"],["nursery_capacity","Nursery capacity (fragments)","number"]];
const examples=[{"reef_site":"Example: Key Largo North","degree_heating_weeks":5.2,"temp_anomaly_c":1.6,"recent_bleaching_pct":18,"nursery_capacity":240},{"reef_site":"Example: Caribbean nursery","degree_heating_weeks":3.1,"temp_anomaly_c":0.8,"recent_bleaching_pct":6,"nursery_capacity":320},{"reef_site":"Example: high-stress outplant site","degree_heating_weeks":8.4,"temp_anomaly_c":2.3,"recent_bleaching_pct":34,"nursery_capacity":80}];
export default function AIReefHeatStressPlanPage() {
  const [form,setForm]=useState(examples[0]); const request=useNativeAIRequest();
  const presets=examples.map((values,index)=>({label:['Baseline scenario','Lower exposure','Higher exposure'][index],values}));
  const payload=()=>Object.fromEntries(fields.map(([key,,type])=>[key,type==='number'?Number(form[key]):form[key]]));
  const valid=fields.every(([key,,type])=>String(form[key]??'').trim()&&(type!=='number'||Number.isFinite(Number(form[key]))&&Number(form[key])>=0));
  const calculate=async event=>{event.preventDefault();if(!valid)return;await request.run(options=>reefHeatStressPlan(payload(),options));};
  return <section className="page"><header className="page-header"><h2>Reef heat-stress calculator</h2></header><p>AI forecasting is unavailable in this workspace. This calculator uses a fixed formula and requires the calculator service to be available.</p><NativeAIControls request={request} presets={presets} description="Each example fills every planning input. Review it before calculating." onFill={values=>setForm({...values})} /><form className="card" onSubmit={calculate}><div className="form-grid">{fields.map(([key,label,type])=><label key={key} htmlFor={'planning-'+key}>{label}<input id={'planning-'+key} type={type} min={type==='number'?0:undefined} step={type==='number'?'any':undefined} required disabled={request.loading} value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})} /></label>)}</div><button className="btn btn-primary" type="submit" disabled={!valid||request.loading} style={{marginTop:16}}>{request.loading?'Calculating…':'Calculate local indicator'}</button></form>{request.result&&<ReadableAIReport result={request.result} title="Local formula result" />}</section>;
}
