import React from 'react';
import FormattedAIReport from './FormattedAIReport';
export default function AIResponse({data}) {
 if(data===null||data===undefined)return null;
 if(data.error)return <FormattedAIReport error={data.error}/>;
 const value=data.response??data.analysis??data.email??data.script??data.strategy??data.feedback??data.battlecard??data.advice??data;
 return <FormattedAIReport response={value} title="AI report"/>;
}
