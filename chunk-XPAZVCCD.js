import{k as xe}from"./chunk-CFSRTQVC.js";import{a as we,b as Se,c as ke,d as Me}from"./chunk-ADHIYY5J.js";import{a as $,b as be,d as z,e as G,f as H}from"./chunk-TIN3U24M.js";import{d as Ce,e as ye}from"./chunk-SZJS6YUP.js";import{Ab as p,Ba as ue,Bb as N,Cb as A,Db as E,Eb as m,F as ae,Ib as W,Jb as q,Kb as U,Lb as fe,Mb as F,Nb as _e,Q as T,R as re,Ra as me,U as se,Va as u,Vb as ve,W as ce,Z as L,_a as R,cc as j,d as v,eb as O,fa as x,fb as pe,ga as I,ha as K,ia as le,ib as g,j as V,ob as P,pb as C,qb as B,rb as he,sb as ge,ta as de,ub as f,yb as s,zb as c}from"./chunk-5423XKIL.js";function Q(){return Q=Object.assign?Object.assign.bind():function(n){for(var t=1;t<arguments.length;t++){var e=arguments[t];for(var a in e)({}).hasOwnProperty.call(e,a)&&(n[a]=e[a])}return n},Q.apply(null,arguments)}function Ve(n){let t=new Uint8Array(n);return window.btoa(String.fromCharCode(...t))}function Le(n){let t=window.atob(n),e=t.length,a=new Uint8Array(e);for(let r=0;r<e;r++)a[r]=t.charCodeAt(r);return a.buffer}var Re=new Blob([`
      const BIAS = 0x84;
      const CLIP = 32635;
      const encodeTable = [
        0,0,1,1,2,2,2,2,3,3,3,3,3,3,3,3,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
        5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
        6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
        6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
        6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
        6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7
      ];
      
      function encodeSample(sample) {
        let sign;
        let exponent;
        let mantissa;
        let muLawSample;
        sign = (sample >> 8) & 0x80;
        if (sign !== 0) sample = -sample;
        sample = sample + BIAS;
        if (sample > CLIP) sample = CLIP;
        exponent = encodeTable[(sample>>7) & 0xFF];
        mantissa = (sample >> (exponent+3)) & 0x0F;
        muLawSample = ~(sign | (exponent << 4) | mantissa);
        
        return muLawSample;
      }
    
      class RawAudioProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
                    
          this.port.onmessage = ({ data }) => {
            switch (data.type) {
              case "setFormat":
                this.isMuted = false;
                this.buffer = []; // Initialize an empty buffer
                this.bufferSize = data.sampleRate / 4;
                this.format = data.format;

                if (globalThis.LibSampleRate && sampleRate !== data.sampleRate) {
                  globalThis.LibSampleRate.create(1, sampleRate, data.sampleRate).then(resampler => {
                    this.resampler = resampler;
                  });
                }
                break;
              case "setMuted":
                this.isMuted = data.isMuted;
                break;
            }
          };
        }
        process(inputs) {
          if (!this.buffer) {
            return true;
          }
          
          const input = inputs[0]; // Get the first input node
          if (input.length > 0) {
            let channelData = input[0]; // Get the first channel's data

            // Resample the audio if necessary
            if (this.resampler) {
              channelData = this.resampler.full(channelData);
            }

            // Add channel data to the buffer
            this.buffer.push(...channelData);
            // Get max volume 
            let sum = 0.0;
            for (let i = 0; i < channelData.length; i++) {
              sum += channelData[i] * channelData[i];
            }
            const maxVolume = Math.sqrt(sum / channelData.length);
            // Check if buffer size has reached or exceeded the threshold
            if (this.buffer.length >= this.bufferSize) {
              const float32Array = this.isMuted 
                ? new Float32Array(this.buffer.length)
                : new Float32Array(this.buffer);

              let encodedArray = this.format === "ulaw"
                ? new Uint8Array(float32Array.length)
                : new Int16Array(float32Array.length);

              // Iterate through the Float32Array and convert each sample to PCM16
              for (let i = 0; i < float32Array.length; i++) {
                // Clamp the value to the range [-1, 1]
                let sample = Math.max(-1, Math.min(1, float32Array[i]));

                // Scale the sample to the range [-32768, 32767]
                let value = sample < 0 ? sample * 32768 : sample * 32767;
                if (this.format === "ulaw") {
                  value = encodeSample(Math.round(value));
                }

                encodedArray[i] = value;
              }

              // Send the buffered data to the main script
              this.port.postMessage([encodedArray, maxVolume]);

              // Clear the buffer after sending
              this.buffer = [];
            }
          }
          return true; // Continue processing
        }
      }
      registerProcessor("raw-audio-processor", RawAudioProcessor);
  `],{type:"application/javascript"}),Be=URL.createObjectURL(Re);function Ee(){return["iPad Simulator","iPhone Simulator","iPod Simulator","iPad","iPhone","iPod"].includes(navigator.platform)||navigator.userAgent.includes("Mac")&&"ontouchend"in document}var X=class n{static create(r){return v(this,arguments,function*({sampleRate:t,format:e,preferHeadphonesForIosDevices:a}){let o=null,i=null;try{let y={sampleRate:{ideal:t},echoCancellation:{ideal:!0},noiseSuppression:{ideal:!0}};if(Ee()&&a){let M=(yield window.navigator.mediaDevices.enumerateDevices()).find(b=>b.kind==="audioinput"&&["airpod","headphone","earphone"].find(h=>b.label.toLowerCase().includes(h)));M&&(y.deviceId={ideal:M.deviceId})}let w=navigator.mediaDevices.getSupportedConstraints().sampleRate;o=new window.AudioContext(w?{sampleRate:t}:{});let S=o.createAnalyser();w||(yield o.audioWorklet.addModule("https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js@2.1.2/dist/libsamplerate.worklet.js")),yield o.audioWorklet.addModule(Be),i=yield navigator.mediaDevices.getUserMedia({audio:y});let D=o.createMediaStreamSource(i),k=new AudioWorkletNode(o,"raw-audio-processor");return k.port.postMessage({type:"setFormat",format:e,sampleRate:t}),D.connect(S),S.connect(k),yield o.resume(),new n(o,S,k,i)}catch(y){var l,d;throw(l=i)==null||l.getTracks().forEach(w=>w.stop()),(d=o)==null||d.close(),y}})}constructor(t,e,a,r){this.context=void 0,this.analyser=void 0,this.worklet=void 0,this.inputStream=void 0,this.context=t,this.analyser=e,this.worklet=a,this.inputStream=r}close(){return v(this,null,function*(){this.inputStream.getTracks().forEach(t=>t.stop()),yield this.context.close()})}setMuted(t){this.worklet.port.postMessage({type:"setMuted",isMuted:t})}},Ne=new Blob([`
      const decodeTable = [0,132,396,924,1980,4092,8316,16764];
      
      export function decodeSample(muLawSample) {
        let sign;
        let exponent;
        let mantissa;
        let sample;
        muLawSample = ~muLawSample;
        sign = (muLawSample & 0x80);
        exponent = (muLawSample >> 4) & 0x07;
        mantissa = muLawSample & 0x0F;
        sample = decodeTable[exponent] + (mantissa << (exponent+3));
        if (sign !== 0) sample = -sample;

        return sample;
      }
      
      class AudioConcatProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.buffers = []; // Initialize an empty buffer
          this.cursor = 0;
          this.currentBuffer = null;
          this.wasInterrupted = false;
          this.finished = false;
          
          this.port.onmessage = ({ data }) => {
            switch (data.type) {
              case "setFormat":
                this.format = data.format;
                break;
              case "buffer":
                this.wasInterrupted = false;
                this.buffers.push(
                  this.format === "ulaw"
                    ? new Uint8Array(data.buffer)
                    : new Int16Array(data.buffer)
                );
                break;
              case "interrupt":
                this.wasInterrupted = true;
                break;
              case "clearInterrupted":
                if (this.wasInterrupted) {
                  this.wasInterrupted = false;
                  this.buffers = [];
                  this.currentBuffer = null;
                }
            }
          };
        }
        process(_, outputs) {
          let finished = false;
          const output = outputs[0][0];
          for (let i = 0; i < output.length; i++) {
            if (!this.currentBuffer) {
              if (this.buffers.length === 0) {
                finished = true;
                break;
              }
              this.currentBuffer = this.buffers.shift();
              this.cursor = 0;
            }

            let value = this.currentBuffer[this.cursor];
            if (this.format === "ulaw") {
              value = decodeSample(value);
            }
            output[i] = value / 32768;
            this.cursor++;

            if (this.cursor >= this.currentBuffer.length) {
              this.currentBuffer = null;
            }
          }

          if (this.finished !== finished) {
            this.finished = finished;
            this.port.postMessage({ type: "process", finished });
          }

          return true; // Continue processing
        }
      }

      registerProcessor("audio-concat-processor", AudioConcatProcessor);
    `],{type:"application/javascript"}),We=URL.createObjectURL(Ne),Z=class n{static create(a){return v(this,arguments,function*({sampleRate:t,format:e}){let r=null;try{r=new AudioContext({sampleRate:t});let i=r.createAnalyser(),l=r.createGain();l.connect(i),i.connect(r.destination),yield r.audioWorklet.addModule(We);let d=new AudioWorkletNode(r,"audio-concat-processor");return d.port.postMessage({type:"setFormat",format:e}),d.connect(l),yield r.resume(),new n(r,i,l,d)}catch(i){var o;throw(o=r)==null||o.close(),i}})}constructor(t,e,a,r){this.context=void 0,this.analyser=void 0,this.gain=void 0,this.worklet=void 0,this.context=t,this.analyser=e,this.gain=a,this.worklet=r}close(){return v(this,null,function*(){yield this.context.close()})}};function Ie(n){return!!n.type}var ee=class n{static create(t){return v(this,null,function*(){let e=null;try{var a;let o=(a=t.origin)!=null?a:"wss://api.elevenlabs.io",i=t.signedUrl?t.signedUrl:o+"/v1/convai/conversation?agent_id="+t.agentId,l=["convai"];t.authorization&&l.push(`bearer.${t.authorization}`),e=new WebSocket(i,l);let d=yield new Promise((M,b)=>{e.addEventListener("open",()=>{var h;let _={type:"conversation_initiation_client_data"};var te,ne,ie,oe;t.overrides&&(_.conversation_config_override={agent:{prompt:(te=t.overrides.agent)==null?void 0:te.prompt,first_message:(ne=t.overrides.agent)==null?void 0:ne.firstMessage,language:(ie=t.overrides.agent)==null?void 0:ie.language},tts:{voice_id:(oe=t.overrides.tts)==null?void 0:oe.voiceId}}),t.customLlmExtraBody&&(_.custom_llm_extra_body=t.customLlmExtraBody),t.dynamicVariables&&(_.dynamic_variables=t.dynamicVariables),(h=e)==null||h.send(JSON.stringify(_))},{once:!0}),e.addEventListener("error",h=>{setTimeout(()=>b(h),0)}),e.addEventListener("close",b),e.addEventListener("message",h=>{let _=JSON.parse(h.data);Ie(_)&&(_.type==="conversation_initiation_metadata"?M(_.conversation_initiation_metadata_event):console.warn("First received message is not conversation metadata."))},{once:!0})}),{conversation_id:y,agent_output_audio_format:w,user_input_audio_format:S}=d,D=Ae(S??"pcm_16000"),k=Ae(w);return new n(e,y,D,k)}catch(o){var r;throw(r=e)==null||r.close(),o}})}constructor(t,e,a,r){this.socket=void 0,this.conversationId=void 0,this.inputFormat=void 0,this.outputFormat=void 0,this.queue=[],this.disconnectionDetails=null,this.onDisconnectCallback=null,this.onMessageCallback=null,this.socket=t,this.conversationId=e,this.inputFormat=a,this.outputFormat=r,this.socket.addEventListener("error",o=>{setTimeout(()=>this.disconnect({reason:"error",message:"The connection was closed due to a socket error.",context:o}),0)}),this.socket.addEventListener("close",o=>{this.disconnect(o.code===1e3?{reason:"agent",context:o}:{reason:"error",message:o.reason||"The connection was closed by the server.",context:o})}),this.socket.addEventListener("message",o=>{try{let i=JSON.parse(o.data);if(!Ie(i))return;this.onMessageCallback?this.onMessageCallback(i):this.queue.push(i)}catch{}})}close(){this.socket.close()}sendMessage(t){this.socket.send(JSON.stringify(t))}onMessage(t){this.onMessageCallback=t,this.queue.forEach(t),this.queue=[]}onDisconnect(t){this.onDisconnectCallback=t,this.disconnectionDetails&&t(this.disconnectionDetails)}disconnect(t){var e;this.disconnectionDetails||(this.disconnectionDetails=t,(e=this.onDisconnectCallback)==null||e.call(this,t))}};function Ae(n){let[t,e]=n.split("_");if(!["pcm","ulaw"].includes(t))throw new Error(`Invalid format: ${n}`);let a=parseInt(e);if(isNaN(a))throw new Error(`Invalid sample rate: ${e}`);return{format:t,sampleRate:a}}var qe={clientTools:{}},Ue={onConnect:()=>{},onDebug:()=>{},onDisconnect:()=>{},onError:()=>{},onMessage:()=>{},onModeChange:()=>{},onStatusChange:()=>{},onCanSendFeedbackChange:()=>{}},J=class n{static startSession(t){return v(this,null,function*(){let e=Q({},qe,Ue,t);e.onStatusChange({status:"connecting"}),e.onCanSendFeedbackChange({canSendFeedback:!1});let a=null,r=null,o=null,i=null;try{var l,d;i=yield navigator.mediaDevices.getUserMedia({audio:!0});let b=(l=t.connectionDelay)!=null?l:{default:0,android:3e3},h=b.default;var y;if(/android/i.test(navigator.userAgent))h=(y=b.android)!=null?y:h;else if(Ee()){var w;h=(w=b.ios)!=null?w:h}return h>0&&(yield new Promise(_=>setTimeout(_,h))),r=yield ee.create(t),[a,o]=yield Promise.all([X.create(Q({},r.inputFormat,{preferHeadphonesForIosDevices:t.preferHeadphonesForIosDevices})),Z.create(r.outputFormat)]),(d=i)==null||d.getTracks().forEach(_=>_.stop()),i=null,new n(e,r,a,o)}catch(b){var S,D,k,M;throw e.onStatusChange({status:"disconnected"}),(S=i)==null||S.getTracks().forEach(h=>h.stop()),(D=r)==null||D.close(),yield(k=a)==null?void 0:k.close(),yield(M=o)==null?void 0:M.close(),b}})}constructor(t,e,a,r){var o=this;this.options=void 0,this.connection=void 0,this.input=void 0,this.output=void 0,this.lastInterruptTimestamp=0,this.mode="listening",this.status="connecting",this.inputFrequencyData=void 0,this.outputFrequencyData=void 0,this.volume=1,this.currentEventId=1,this.lastFeedbackEventId=1,this.canSendFeedback=!1,this.endSession=()=>this.endSessionWithDetails({reason:"user"}),this.endSessionWithDetails=function(i){return v(this,null,function*(){o.status!=="connected"&&o.status!=="connecting"||(o.updateStatus("disconnecting"),o.connection.close(),yield o.input.close(),yield o.output.close(),o.updateStatus("disconnected"),o.options.onDisconnect(i))})},this.updateMode=i=>{i!==this.mode&&(this.mode=i,this.options.onModeChange({mode:i}))},this.updateStatus=i=>{i!==this.status&&(this.status=i,this.options.onStatusChange({status:i}))},this.updateCanSendFeedback=()=>{let i=this.currentEventId!==this.lastFeedbackEventId;this.canSendFeedback!==i&&(this.canSendFeedback=i,this.options.onCanSendFeedbackChange({canSendFeedback:i}))},this.onMessage=function(i){return v(this,null,function*(){switch(i.type){case"interruption":return i.interruption_event&&(o.lastInterruptTimestamp=i.interruption_event.event_id),void o.fadeOutAudio();case"agent_response":return void o.options.onMessage({source:"ai",message:i.agent_response_event.agent_response});case"user_transcript":return void o.options.onMessage({source:"user",message:i.user_transcription_event.user_transcript});case"internal_tentative_agent_response":return void o.options.onDebug({type:"tentative_agent_response",response:i.tentative_agent_response_internal_event.tentative_agent_response});case"client_tool_call":if(console.info("Received client tool call request",i.client_tool_call),o.options.clientTools.hasOwnProperty(i.client_tool_call.tool_name))try{var l;let d=(l=yield o.options.clientTools[i.client_tool_call.tool_name](i.client_tool_call.parameters))!=null?l:"Client tool execution successful.",y=typeof d=="object"?JSON.stringify(d):String(d);o.connection.sendMessage({type:"client_tool_result",tool_call_id:i.client_tool_call.tool_call_id,result:y,is_error:!1})}catch(d){o.onError("Client tool execution failed with following error: "+d?.message,{clientToolName:i.client_tool_call.tool_name}),o.connection.sendMessage({type:"client_tool_result",tool_call_id:i.client_tool_call.tool_call_id,result:"Client tool execution failed: "+d?.message,is_error:!0})}else{if(o.options.onUnhandledClientToolCall)return void o.options.onUnhandledClientToolCall(i.client_tool_call);o.onError(`Client tool with name ${i.client_tool_call.tool_name} is not defined on client`,{clientToolName:i.client_tool_call.tool_name}),o.connection.sendMessage({type:"client_tool_result",tool_call_id:i.client_tool_call.tool_call_id,result:`Client tool with name ${i.client_tool_call.tool_name} is not defined on client`,is_error:!0})}return;case"audio":return void(o.lastInterruptTimestamp<=i.audio_event.event_id&&(o.addAudioBase64Chunk(i.audio_event.audio_base_64),o.currentEventId=i.audio_event.event_id,o.updateCanSendFeedback(),o.updateMode("speaking")));case"ping":return void o.connection.sendMessage({type:"pong",event_id:i.ping_event.event_id});default:return void o.options.onDebug(i)}})},this.onInputWorkletMessage=i=>{this.status==="connected"&&this.connection.sendMessage({user_audio_chunk:Ve(i.data[0].buffer)})},this.onOutputWorkletMessage=({data:i})=>{i.type==="process"&&this.updateMode(i.finished?"listening":"speaking")},this.addAudioBase64Chunk=i=>{this.output.gain.gain.value=this.volume,this.output.worklet.port.postMessage({type:"clearInterrupted"}),this.output.worklet.port.postMessage({type:"buffer",buffer:Le(i)})},this.fadeOutAudio=()=>{this.updateMode("listening"),this.output.worklet.port.postMessage({type:"interrupt"}),this.output.gain.gain.exponentialRampToValueAtTime(1e-4,this.output.context.currentTime+2),setTimeout(()=>{this.output.gain.gain.value=this.volume,this.output.worklet.port.postMessage({type:"clearInterrupted"})},2e3)},this.onError=(i,l)=>{console.error(i,l),this.options.onError(i,l)},this.calculateVolume=i=>{if(i.length===0)return 0;let l=0;for(let d=0;d<i.length;d++)l+=i[d]/255;return l/=i.length,l<0?0:l>1?1:l},this.getId=()=>this.connection.conversationId,this.isOpen=()=>this.status==="connected",this.setVolume=({volume:i})=>{this.volume=i},this.setMicMuted=i=>{this.input.setMuted(i)},this.getInputByteFrequencyData=()=>(this.inputFrequencyData!=null||(this.inputFrequencyData=new Uint8Array(this.input.analyser.frequencyBinCount)),this.input.analyser.getByteFrequencyData(this.inputFrequencyData),this.inputFrequencyData),this.getOutputByteFrequencyData=()=>(this.outputFrequencyData!=null||(this.outputFrequencyData=new Uint8Array(this.output.analyser.frequencyBinCount)),this.output.analyser.getByteFrequencyData(this.outputFrequencyData),this.outputFrequencyData),this.getInputVolume=()=>this.calculateVolume(this.getInputByteFrequencyData()),this.getOutputVolume=()=>this.calculateVolume(this.getOutputByteFrequencyData()),this.sendFeedback=i=>{this.canSendFeedback?(this.connection.sendMessage({type:"feedback",score:i?"like":"dislike",event_id:this.currentEventId}),this.lastFeedbackEventId=this.currentEventId,this.updateCanSendFeedback()):console.warn(this.lastFeedbackEventId===0?"Cannot send feedback: the conversation has not started yet.":"Cannot send feedback: feedback has already been sent for the current response.")},this.options=t,this.connection=e,this.input=a,this.output=r,this.options.onConnect({conversationId:e.conversationId}),this.connection.onDisconnect(this.endSessionWithDetails),this.connection.onMessage(this.onMessage),this.input.worklet.port.onmessage=this.onInputWorkletMessage,this.output.worklet.port.onmessage=this.onOutputWorkletMessage,this.updateStatus("connected")}};var je=["determinateSpinner"];function $e(n,t){if(n&1&&(K(),s(0,"svg",11),p(1,"circle",12),c()),n&2){let e=m();P("viewBox",e._viewBox()),u(),B("stroke-dasharray",e._strokeCircumference(),"px")("stroke-dashoffset",e._strokeCircumference()/2,"px")("stroke-width",e._circleStrokeWidth(),"%"),P("r",e._circleRadius())}}var ze=new ce("mat-progress-spinner-default-options",{providedIn:"root",factory:Ge});function Ge(){return{diameter:Te}}var Te=100,He=10,Oe=(()=>{class n{_elementRef=L(de);_noopAnimations;get color(){return this._color||this._defaultColor}set color(e){this._color=e}_color;_defaultColor="primary";_determinateCircle;constructor(){let e=L(ue,{optional:!0}),a=L(ze);this._noopAnimations=e==="NoopAnimations"&&!!a&&!a._forceAnimations,this.mode=this._elementRef.nativeElement.nodeName.toLowerCase()==="mat-spinner"?"indeterminate":"determinate",a&&(a.color&&(this.color=this._defaultColor=a.color),a.diameter&&(this.diameter=a.diameter),a.strokeWidth&&(this.strokeWidth=a.strokeWidth))}mode;get value(){return this.mode==="determinate"?this._value:0}set value(e){this._value=Math.max(0,Math.min(100,e||0))}_value=0;get diameter(){return this._diameter}set diameter(e){this._diameter=e||0}_diameter=Te;get strokeWidth(){return this._strokeWidth??this.diameter/10}set strokeWidth(e){this._strokeWidth=e||0}_strokeWidth;_circleRadius(){return(this.diameter-He)/2}_viewBox(){let e=this._circleRadius()*2+this.strokeWidth;return`0 0 ${e} ${e}`}_strokeCircumference(){return 2*Math.PI*this._circleRadius()}_strokeDashOffset(){return this.mode==="determinate"?this._strokeCircumference()*(100-this._value)/100:null}_circleStrokeWidth(){return this.strokeWidth/this.diameter*100}static \u0275fac=function(a){return new(a||n)};static \u0275cmp=O({type:n,selectors:[["mat-progress-spinner"],["mat-spinner"]],viewQuery:function(a,r){if(a&1&&W(je,5),a&2){let o;q(o=U())&&(r._determinateCircle=o.first)}},hostAttrs:["role","progressbar","tabindex","-1",1,"mat-mdc-progress-spinner","mdc-circular-progress"],hostVars:18,hostBindings:function(a,r){a&2&&(P("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",r.mode==="determinate"?r.value:null)("mode",r.mode),ge("mat-"+r.color),B("width",r.diameter,"px")("height",r.diameter,"px")("--mdc-circular-progress-size",r.diameter+"px")("--mdc-circular-progress-active-indicator-width",r.diameter+"px"),he("_mat-animation-noopable",r._noopAnimations)("mdc-circular-progress--indeterminate",r.mode==="indeterminate"))},inputs:{color:"color",mode:"mode",value:[2,"value","value",j],diameter:[2,"diameter","diameter",j],strokeWidth:[2,"strokeWidth","strokeWidth",j]},exportAs:["matProgressSpinner"],decls:14,vars:11,consts:[["circle",""],["determinateSpinner",""],["aria-hidden","true",1,"mdc-circular-progress__determinate-container"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__determinate-circle-graphic"],["cx","50%","cy","50%",1,"mdc-circular-progress__determinate-circle"],["aria-hidden","true",1,"mdc-circular-progress__indeterminate-container"],[1,"mdc-circular-progress__spinner-layer"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-left"],[3,"ngTemplateOutlet"],[1,"mdc-circular-progress__gap-patch"],[1,"mdc-circular-progress__circle-clipper","mdc-circular-progress__circle-right"],["xmlns","http://www.w3.org/2000/svg","focusable","false",1,"mdc-circular-progress__indeterminate-circle-graphic"],["cx","50%","cy","50%"]],template:function(a,r){if(a&1&&(g(0,$e,2,8,"ng-template",null,0,ve),s(2,"div",2,1),K(),s(4,"svg",3),p(5,"circle",4),c()(),le(),s(6,"div",5)(7,"div",6)(8,"div",7),N(9,8),c(),s(10,"div",9),N(11,8),c(),s(12,"div",10),N(13,8),c()()()),a&2){let o=fe(1);u(4),P("viewBox",r._viewBox()),u(),B("stroke-dasharray",r._strokeCircumference(),"px")("stroke-dashoffset",r._strokeDashOffset(),"px")("stroke-width",r._circleStrokeWidth(),"%"),P("r",r._circleRadius()),u(4),C("ngTemplateOutlet",o),u(2),C("ngTemplateOutlet",o),u(2),C("ngTemplateOutlet",o)}},dependencies:[Ce],styles:[".mat-mdc-progress-spinner{display:block;overflow:hidden;line-height:0;position:relative;direction:ltr;transition:opacity 250ms cubic-bezier(0.4, 0, 0.6, 1)}.mat-mdc-progress-spinner circle{stroke-width:var(--mdc-circular-progress-active-indicator-width, 4px)}.mat-mdc-progress-spinner._mat-animation-noopable,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__determinate-circle{transition:none !important}.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-circle-graphic,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__spinner-layer,.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container{animation:none !important}.mat-mdc-progress-spinner._mat-animation-noopable .mdc-circular-progress__indeterminate-container circle{stroke-dasharray:0 !important}@media(forced-colors: active){.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic,.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle{stroke:currentColor;stroke:CanvasText}}.mdc-circular-progress__determinate-container,.mdc-circular-progress__indeterminate-circle-graphic,.mdc-circular-progress__indeterminate-container,.mdc-circular-progress__spinner-layer{position:absolute;width:100%;height:100%}.mdc-circular-progress__determinate-container{transform:rotate(-90deg)}.mdc-circular-progress--indeterminate .mdc-circular-progress__determinate-container{opacity:0}.mdc-circular-progress__indeterminate-container{font-size:0;letter-spacing:0;white-space:nowrap;opacity:0}.mdc-circular-progress--indeterminate .mdc-circular-progress__indeterminate-container{opacity:1;animation:mdc-circular-progress-container-rotate 1568.2352941176ms linear infinite}.mdc-circular-progress__determinate-circle-graphic,.mdc-circular-progress__indeterminate-circle-graphic{fill:rgba(0,0,0,0)}.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic{stroke:var(--mdc-circular-progress-active-indicator-color, var(--mat-sys-primary))}@media(forced-colors: active){.mat-mdc-progress-spinner .mdc-circular-progress__determinate-circle,.mat-mdc-progress-spinner .mdc-circular-progress__indeterminate-circle-graphic{stroke:CanvasText}}.mdc-circular-progress__determinate-circle{transition:stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1)}.mdc-circular-progress__gap-patch{position:absolute;top:0;left:47.5%;box-sizing:border-box;width:5%;height:100%;overflow:hidden}.mdc-circular-progress__gap-patch .mdc-circular-progress__indeterminate-circle-graphic{left:-900%;width:2000%;transform:rotate(180deg)}.mdc-circular-progress__circle-clipper .mdc-circular-progress__indeterminate-circle-graphic{width:200%}.mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic{left:-100%}.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-left .mdc-circular-progress__indeterminate-circle-graphic{animation:mdc-circular-progress-left-spin 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress--indeterminate .mdc-circular-progress__circle-right .mdc-circular-progress__indeterminate-circle-graphic{animation:mdc-circular-progress-right-spin 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}.mdc-circular-progress__circle-clipper{display:inline-flex;position:relative;width:50%;height:100%;overflow:hidden}.mdc-circular-progress--indeterminate .mdc-circular-progress__spinner-layer{animation:mdc-circular-progress-spinner-layer-rotate 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both}@keyframes mdc-circular-progress-container-rotate{to{transform:rotate(360deg)}}@keyframes mdc-circular-progress-spinner-layer-rotate{12.5%{transform:rotate(135deg)}25%{transform:rotate(270deg)}37.5%{transform:rotate(405deg)}50%{transform:rotate(540deg)}62.5%{transform:rotate(675deg)}75%{transform:rotate(810deg)}87.5%{transform:rotate(945deg)}100%{transform:rotate(1080deg)}}@keyframes mdc-circular-progress-left-spin{from{transform:rotate(265deg)}50%{transform:rotate(130deg)}to{transform:rotate(265deg)}}@keyframes mdc-circular-progress-right-spin{from{transform:rotate(-265deg)}50%{transform:rotate(-130deg)}to{transform:rotate(-265deg)}}"],encapsulation:2,changeDetection:0})}return n})();var Pe=(()=>{class n{static \u0275fac=function(a){return new(a||n)};static \u0275mod=pe({type:n});static \u0275inj=se({imports:[xe]})}return n})();function Ke(n,t){if(n&1&&(p(0,"img",3),s(1,"p",4),F(2),c()),n&2){let e=m();C("src",e.contactActive.avatar,me),u(2),_e(e.contactActive.name)}}function Xe(n,t){if(n&1){let e=A();s(0,"img",6),E("click",function(){x(e);let r=m(2);return I(r.endCall())}),c()}}function Ze(n,t){if(n&1){let e=A();s(0,"img",9),E("click",function(){x(e);let r=m(3);return I(r.startCall())}),c()}}function et(n,t){n&1&&p(0,"mat-spinner",8),n&2&&C("diameter",50)}function tt(n,t){if(n&1&&g(0,Ze,1,0,"img",7)(1,et,1,1,"mat-spinner",8),n&2){let e=m(2);f(e.loading?1:0)}}function nt(n,t){if(n&1&&(s(0,"div",2),g(1,Xe,1,0,"img",5)(2,tt,2,1),c()),n&2){let e=m();u(),f(e.callActive?1:2)}}function it(n,t){if(n&1){let e=A();s(0,"button",10),E("click",function(){x(e);let r=m();return I(r.requestMicrophonePermission())}),s(1,"span"),F(2,"\u05D0\u05E4\u05E9\u05E8 \u05D2\u05D9\u05E9\u05D4 \u05DC\u05DE\u05D9\u05E7\u05E8\u05D5\u05E4\u05D5\u05DF"),c()()}}var Y=class n{constructor(t){this.stateManagementService=t}agentId;conversation;callActive=!1;hasPermission=!0;stream;destroy$=new V;contactActive;config;micOnMute=!1;speakerMuted=100;loading=!1;ngOnInit(){this.stateManagementService.contactStore.pipe(G()).pipe(T(this.destroy$)).subscribe(t=>{this.contactActive=t}),this.stateManagementService.platformState.pipe($(t=>t)).pipe(T(this.destroy$)).subscribe(t=>{this.config=t}),this.requestMicrophonePermission()}requestMicrophonePermission(){return v(this,null,function*(){try{this.stream=yield navigator.mediaDevices.getUserMedia({audio:!0})}catch{this.hasPermission=!0}})}ngOnDestroy(){this.destroy$.next(!0),this.destroy$.complete(),this.endCall(),this.stream?.getAudioTracks().forEach(t=>{t.stop()})}unSelect(){this.stateManagementService.contactStore.update(z(null))}startCall(){return v(this,null,function*(){this.loading=!0,this.conversation=yield J.startSession({agentId:this.agentId,onConnect:this.onConnect.bind(this),onModeChange:this.onModeChange.bind(this),onDisconnect:this.onDisconnect.bind(this)}),this.loading=!1,this.callActive=!0})}endCall(){this.conversation?.endSession(),this.callActive=!1}setMicMuted(t){this.conversation.setMicMuted(t),this.micOnMute=t}onConnect(t){console.log(t)}onDisconnect(){this.callActive=!1}onModeChange(t){console.log("mode ",t)}static \u0275fac=function(e){return new(e||n)(R(H))};static \u0275cmp=O({type:n,selectors:[["app-voice-conversation"]],inputs:{agentId:"agentId"},decls:6,vars:2,consts:[[1,"contact"],[1,"voice-button"],[1,"buttons"],[1,"avatar",3,"src"],[1,"contact-info"],["src","/icones/rejected.png","alt",""],["src","/icones/rejected.png","alt","",3,"click"],["src","/icones/phone-call.png","alt",""],[3,"diameter"],["src","/icones/phone-call.png","alt","",3,"click"],[3,"click"]],template:function(e,a){e&1&&(s(0,"main")(1,"div",0),g(2,Ke,3,2),c(),s(3,"div",1),g(4,nt,3,1,"div",2)(5,it,3,0,"button"),c()()),e&2&&(u(2),f(a.contactActive?2:-1),u(2),f(a.hasPermission?4:5))},dependencies:[ye,Pe,Oe],styles:["main[_ngcontent-%COMP%]{width:100%;height:100%;display:flex;flex-wrap:wrap;justify-content:center;background-color:#eff2f4;background-size:cover;background-repeat:no-repeat;background-position:center}main[_ngcontent-%COMP%]   .contact[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;justify-content:center;height:70%;width:100%}main[_ngcontent-%COMP%]   .contact[_ngcontent-%COMP%]   .avatar[_ngcontent-%COMP%]{width:250px;height:250px}main[_ngcontent-%COMP%]   .contact[_ngcontent-%COMP%]   .contact-info[_ngcontent-%COMP%]{font-weight:500}main[_ngcontent-%COMP%]   .voice-button[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:center;height:30%;width:100%}main[_ngcontent-%COMP%]   .voice-button[_ngcontent-%COMP%]   .buttons[_ngcontent-%COMP%]{height:100%;display:flex;gap:.5rem}img[_ngcontent-%COMP%]{height:40px}"]})};var ot=["elevenlabs"];function at(n,t){if(n&1){let e=A();s(0,"div",8)(1,"div",12),E("click",function(){x(e);let r=m(2);return I(r.unSelect())}),p(2,"img",13),c(),s(3,"div",14),p(4,"app-contact",15),c()()}if(n&2){let e=m(2);u(4),C("contact",e.contactActive)}}function rt(n,t){if(n&1&&p(0,"app-voice-conversation",11),n&2){let e=m(2);C("agentId",e.contactActive.botId)}}function st(n,t){if(n&1&&(s(0,"section",0)(1,"div",2),p(2,"app-navigation"),c(),s(3,"div",3)(4,"div",4)(5,"div",5)(6,"div",6),p(7,"img",7),s(8,"strong"),F(9,"Voice Contact"),c()(),g(10,at,5,1,"div",8),c()(),s(11,"div",9),p(12,"app-contact-list"),c(),s(13,"div",10),g(14,rt,1,1,"app-voice-conversation",11),c()()()),n&2){let e=m();u(10),f(e.contactActive?10:-1),u(4),f(e.contactActive&&e.contactActive.isOnline?14:-1)}}function ct(n,t){n&1&&(s(0,"div",6)(1,"strong"),F(2,"Voice Contact"),c()())}function lt(n,t){if(n&1){let e=A();s(0,"div",8)(1,"div",12),E("click",function(){x(e);let r=m(2);return I(r.unSelect())}),p(2,"img",17),c(),s(3,"div",14),p(4,"app-contact",15),c()()}if(n&2){let e=m(2);u(4),C("contact",e.contactActive)}}function dt(n,t){n&1&&(s(0,"div",9),p(1,"app-contact-list"),c())}function ut(n,t){if(n&1&&p(0,"app-voice-conversation",11),n&2){let e=m(3);C("agentId",e.contactActive.botId)}}function mt(n,t){if(n&1&&(s(0,"div",10),g(1,ut,1,1,"app-voice-conversation",11),c()),n&2){let e=m(2);u(),f(e.contactActive&&e.contactActive.isOnline?1:-1)}}function pt(n,t){if(n&1&&(s(0,"section",1)(1,"div",3)(2,"div",4)(3,"div",5),g(4,ct,3,0,"div",6)(5,lt,5,1,"div",8),s(6,"div",16),p(7,"app-mobile-navigation"),c()()(),g(8,dt,2,0,"div",9)(9,mt,2,1,"div",10),c()()),n&2){let e=m();u(4),f(e.contactActive?5:4),u(4),f(e.contactActive?9:8)}}var Fe=class n{constructor(t){this.stateManagementService=t}elevenlabs;destroy$=new V;config;contactActive;ngOnInit(){this.stateManagementService.platformState.pipe($(t=>t)).pipe(T(this.destroy$)).subscribe(t=>{this.config=t}),this.stateManagementService.contactStore.pipe(G()).pipe(re(()=>this.contactActive=void 0),T(this.destroy$),ae(500)).subscribe(t=>{this.contactActive=t}),this.stateManagementService.contactStore.update(be([{botId:"SNtkCjXvhi98Yu1dCufr",clientId:"21a8f17c-6766-4087-af30-953a9ca03ca6",name:"Paul Carrington",voiceImageActive:"./background-image/voice/paul-carrington-blur.png",avatar:"./avatar/paul.png",isOnline:!0},{botId:"LtfTvoKMU4FI3Lpwwayw",clientId:"21a8f17c-6766-4087-af30-953a9ca03ca6",voiceImage:"./background-image/voice/debby-voice.png",voiceImageActive:"./background-image/voice/debby-halston-blur.png",name:"Debby Halston",avatar:"./avatar/debby.png",isOnline:!0},{botId:"b7GsRJA1IURt8P0prB0b",clientId:"21a8f17c-6766-4087-af30-953a9ca03ca3",voiceImageActive:"./background-image/voice/morgan-lancaster-blur.png",name:"Morgan Lancaster",avatar:"./avatar/morgan.png",isOnline:!0},{botId:"191db63d-4df1-4f63-8773-e8406cf04db3",clientId:"843a39c3-76a4-44f9-b096-ecf3f85c1dd3",name:"Emma Brown",avatar:"./avatar/emma.png",isOnline:!1}]))}ngOnDestroy(){this.destroy$.next(!0),this.destroy$.complete(),this.stateManagementService.contactStore.reset()}unSelect(){this.stateManagementService.contactStore.update(z(null))}static \u0275fac=function(e){return new(e||n)(R(H))};static \u0275cmp=O({type:n,selectors:[["app-layout"]],viewQuery:function(e,a){if(e&1&&W(ot,5),e&2){let r;q(r=U())&&(a.elevenlabs=r.first)}},decls:2,vars:2,consts:[[1,"desktop-layout"],[1,"mobile-layout"],[1,"navigation"],[1,"content"],[1,"header"],[1,"selected-contact"],[1,"contacts-header"],["src","./icones/phone-contact.svg","alt","",2,"width","24px"],[1,"contact-wrapper"],[1,"contacts"],[1,"message"],[3,"agentId"],[1,"icon",3,"click"],["src","./icones/close.png"],[1,"contact"],[3,"contact"],[1,"mobile-navigation"],["src","./icones/back.png"]],template:function(e,a){e&1&&g(0,st,15,2,"section",0)(1,pt,10,2,"section",1),e&2&&(f((a.config==null?null:a.config.platform)==="desktop"?0:-1),u(),f(a.config&&a.config.platform==="mobile"?1:-1))},dependencies:[ke,Se,Y,we,Me],encapsulation:2})};export{Fe as VoiceLayoutComponent};
