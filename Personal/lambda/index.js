/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
let persistenceAdapter = getPersistenceAdapter(); 

function getPersistenceAdapter() {
    // This function is an indirect way to detect if this is part of an Alexa-Hosted skill
    function isAlexaHosted() {
        return process.env.S3_PERSISTENCE_BUCKET ? true : false;
    }
    const tableName = 'gatos_table';
    if(isAlexaHosted()) {
        const {S3PersistenceAdapter} = require('ask-sdk-s3-persistence-adapter');
        return new S3PersistenceAdapter({ 
            bucketName: process.env.S3_PERSISTENCE_BUCKET
        });
    } else {
        // IMPORTANT: don't forget to give DynamoDB access to the role you're to run this lambda (IAM)
        const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
        return new DynamoDbPersistenceAdapter({ 
            tableName: tableName,
            createTable: true
        });
    }
}

let datasource = {
    "datos": {
        "titleHeader": ".",
        "subtitleHeader": ".",
        "bolsaAlimento": ".",
        "infoAlimento": ".",
        "color":".",
        "colorHeader":"."
    }
};

let datasource1 = {
    "data": {
        "titleHeader": "Bienvenido a Croquetas para Gatos",
        "subtitleHeader": "La mejor información sobre alimentos para gato",
        "color": "#8A61BA",
        "colorHeader": "black",
        "textFooter": "Puedes preguntar informacion sobre alimentos para gatos, recomendaciones de compra y de uso"
    }
};

let datasource2 = {
    "data": {
        "titleHeader": "¿Necesitas Ayuda?",
        "subtitleHeader": "La mejor información sobre alimentos para gato",
        "color": "#8A61BA",
        "colorHeader": "black",
        "textFooter": "Puedes decirme algo como: info sobre la marca whiskas, recomendaciones para comprar, sugerencia de uso."
    }
};

let datasource3 = {
    "data": {
        "titleHeader": "Hasta Luego!",
        "subtitleHeader": "",
        "color": "#8A61BA",
        "colorHeader": "black",
        "textFooter": "Nos vemos despues "
    }
};

let datasource4 = {
    "data": {
        "titleHeader": "Porciones de Alimento para mi gato",
        "subtitleHeader": "Todo depende de la edad y peso",
        "color": "#8A61BA",
        "colorHeader": "black",
        "textFooter": "Tu gato debera consumir de 30 a 80 gramos de comida 2 veces al dia",
        "imagen": "https://images.unsplash.com/photo-1593288942460-e321b92a6cde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80"
    }
};

const languageStrings = {
    en: {
        translation: {
            WELCOME_MESSAGE: 'Welcome to Cat Croquettes. You can ask for information about cat food, purchasing recommendations, usage advice, and suitable portions for your feline friend.',
            cancelacion:'ok, see you later',
            fallback:'Im sorry, I dont have information about that brand.',
            help: 'Do you need assistance? You can tell me something like: "kitekat brand cat croquettes", How much food should I give my cat, Buying recommendations or Usage recommendation',
            recomen:'Here are some shopping recommendations: Have a veterinarian recommend the food, Observe if the kibbles suit your cat well, Take into account the quality, Consider the cost-effectiveness.',
            uso: 'Here are some recommendations for the use of the food: Follow the suggested portions, Take precautions if you change their diet, Keep the food fresh, Provide an ample supply of water'            
            
        }
    },
    es:{
        translation: {
            WELCOME_MESSAGE: 'Bienvenido a Croquetas para Gatos, puedes preguntar informacion sobre alimentos para gatos, recomendaciones de compra, de uso y sobre porciones adecuadas para tu amigo felino',
            cancelacion:'Hasta luego',
            fallback:'lo siento, no tengo información sobre esa marca',
            help: '¿Quieres ayuda?, puedes decirme algo como: info sobre la marca whiskas, porciones de alimento para mi gato, sugerencia de uso o recomendaciones de compra',
            recomen:'Ten unas recomendaciones para tus compras: Que un veterinario recomiende el alimento, Observa si sus croquetas le sientan bien, Toma en cuenta la calidad, Considera el rendimiento.',
            uso:'Ten unas recomendaciones para el uso del alimento: Sigue las porciones sugeridas, Toma precauciones si cambias su dieta , Mantén fresco el alimento, sirve suficiente agua.'
        }
    }
}

const alimentos = {
  "kitekat": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "minino plus": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "nucat": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "purina cat chow": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "gatina": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "purina felix": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "whiskas": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "purina felix gatitos": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "whiskas gatitos": "Irregularidades. ¡Que no te confundan! Presenta imágenes ilustrativas que no reflejan la realidad de sus ingredientes cárnicos, ya que contiene harinas.",
  "purina pro plan kitten": "Alimento balanceado completo para gatitos hasta de 12 meses, hembras gestantes o lactantes de todas las razas.",
  "purina pro plan adult": "Alimento completo y balanceado para gatos con prebiótico.",
  "grancat": "Irregularidades. No cumple con el contenido mínimo de proteína declarada por lo que no es veraz, pudiendo infringir la Ley Federal de Protección al Consumidor (LFPC)."
};

const alimentos1 = {
  "kitekat": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "minino plus": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "nucat": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "purina cat chow": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "gatina": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "purina felix": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "whiskas": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "purina felix kitten": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "whiskas kitten": "Irregularities. Don't be deceived! It presents illustrative images that do not reflect the reality of its meat ingredients, as it contains fillers.",
  "purina pro plan kitten": "Complete and balanced food for kittens up to 12 months, pregnant or lactating females of all breeds.",
  "purina pro plan adult": "Complete and balanced food for cats with prebiotic.",
  "grancat": "Irregularities. It does not meet the minimum declared protein content, which is not truthful and may violate the Federal Law for Consumer Protection (LFPC)."
};


function obtenerInformacionAlimento(nombreAlimento) {
    const nombreAlimentoMinuscula = nombreAlimento.toLowerCase();
  // Verificar si el alimento está en el JSON
  if (alimentos.hasOwnProperty(nombreAlimentoMinuscula)) {
    // Obtener la información del alimento y asignarla a una variable
    const informacion = alimentos[nombreAlimentoMinuscula];
    
    // Retornar la información si es necesario
    return informacion;
  } else {
    // El alimento no está en el JSON
    const informacion = `No se encontró información para ${nombreAlimentoMinuscula}`
    
    // Retornar un valor nulo o un mensaje de error si es necesario
    return informacion;
  }
}

function obtenerInformacionAlimento1(nombreAlimento) {
    const nombreAlimentoMinuscula = nombreAlimento.toLowerCase();
  // Verificar si el alimento está en el JSON
  if (alimentos.hasOwnProperty(nombreAlimentoMinuscula)) {
    // Obtener la información del alimento y asignarla a una variable
    const informacion = alimentos1[nombreAlimentoMinuscula];
    
    // Retornar la información si es necesario
    return informacion;
  } else {
    // El alimento no está en el JSON
    const informacion = `No information found for ${nombreAlimentoMinuscula}`
    
    // Retornar un valor nulo o un mensaje de error si es necesario
    return informacion;
  }
}


const createDirectivePayload = (aplDocumentId, dataSources = {}, tokenId = "documentToken") => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: tokenId,
        document: {
            type: "Link",
            src: "doc://alexa/apl/documents/" + aplDocumentId
        },
        datasources: dataSources
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('WELCOME_MESSAGE');
        
        let id = "launch"
        if(speakOutput==="Welcome to Cat Croquettes. You can ask for information about cat food, purchasing recommendations, usage advice, and suitable portions for your feline friend."){
            datasource1.data.titleHeader="Welcome to Cat Croquettes."
            datasource1.data.subtitleHeader="The best information about cat food."
            datasource1.data.textFooter="You can ask for information about cat food, purchasing recommendations, and usage advice."
        }else{
            datasource1.data.titleHeader="Bienvenido a Croquetas para Gatos"
            datasource1.data.subtitleHeader="La mejor informacion sobre alimento para Gatos"
            datasource1.data.textFooter="Puedes preguntar informacion sobre alimentos para gatos, recomendaciones de compra y de uso"
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(id,datasource1);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const MarcaIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'marcasIntent';
    },
    handle(handlerInput) {
        
        const {intent} = handlerInput.requestEnvelope.request;
        
        const marca = intent.slots.marca.value;
        let gato = intent.slots.gato.value;
        let informacionAlimento = obtenerInformacionAlimento(marca);
        let DOCUMENT_ID;
        
        
        
        if (gato==="cat"){
            
            informacionAlimento = obtenerInformacionAlimento1(marca);
            
            if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                // generate the APL RenderDocument directive that will be returned from your skill
                
                if(marca.toLowerCase()==="kitekat"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Kitekat"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/FRxWJ21q/kitekat.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/L6GThHN5/kitekatinfo.png"
                    datasource.datos.color="#769E26"
                    datasource.datos.colorHeader="red"
                    
                }else if(marca.toLowerCase()==="minino plus"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Minino Plus"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/4xRvvWtQ/mininoplus.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/WprwDRq1/mininoplusinfo.png"
                    datasource.datos.color="#8D8D99"
                    datasource.datos.colorHeader="orange"
                    
                }else if(marca.toLowerCase()==="nucat"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Nucat"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/SQCk8c56/nucat.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/L5w1rLtB/nucatinfo.png"
                    datasource.datos.color="#ED61A7"
                    datasource.datos.colorHeader="#5B9922"
                    
                }else if(marca.toLowerCase()==="purina cat chow"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina Cat Chow"
                    datasource.datos.subtitleHeader="Balanced food"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/rmwpVsgd/catchow.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/T2ZW9jCC/catchowinfo.png"
                    datasource.datos.color="#1975D1"
                    datasource.datos.colorHeader="#F0B811"
                    
                }else if(marca.toLowerCase()==="gatina"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Gatina"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/Qt8z2bFG/gatina.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/BnxMJVPL/gatinainfo.png"
                    datasource.datos.color="#D93A00"
                    datasource.datos.colorHeader="#8D6A11"
                    
                }else if(marca.toLowerCase()==="purina felix"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina Felix"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/V66vHB45/purinafelix.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/PxrdKWTJ/purinafelixinfo.png"
                    datasource.datos.color="#427AA8"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="whiskas"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Whiskas"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/vHQYCY3C/whiskas.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/Zq17yqWR/whiskasinfo.png"
                    datasource.datos.color="#C701C1"
                    datasource.datos.colorHeader="#717063"
                    
                }else if(marca.toLowerCase()==="purina felix gatitos"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina Felix Gatitos"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/3xxm9Zg0/purinafelixgatitos.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/bYLBvmNs/felixgatitosinfo.png"
                    datasource.datos.color="#427AA8"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="whiskas gatitos"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Whiskas Gatitos"
                    datasource.datos.subtitleHeader="Don't be deceived!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/9FYnNTMH/whiskasgatitos.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/FKMZ9y8P/whiskas-gatito-ingles.png"
                    datasource.datos.color="#8A61BA"
                    datasource.datos.colorHeader="orange"
                    
                }else if(marca.toLowerCase()==="purina pro plan kitten"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina pro plan kitten"
                    datasource.datos.subtitleHeader="Balanced food!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/CKDc5jsz/proplangatito.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/ZR6YwDF4/proplangatitoinfo.png"
                    datasource.datos.color="#0099CC"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="purina pro plan adult"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina pro plan Adulto"
                    datasource.datos.subtitleHeader="Balanced food!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/9fKycWbY/proplanadult.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/HLDBt9Dg/proplaninfo.png"
                    datasource.datos.color="#B22222"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="grancat"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Grancat"
                    datasource.datos.subtitleHeader="It is not true!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/fRVcvLvc/grancat.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/fRQHkYs3/grancatinfo.png"
                    datasource.datos.color="#FFA07A"
                    datasource.datos.colorHeader="#00D8FF"
                    
                }
                
                const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
                // add the RenderDocument directive to the responseBuilder
                handlerInput.responseBuilder.addDirective(aplDirective);
            }
        }else{
            
            if(Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){
                
                // generate the APL RenderDocument directive that will be returned from your skill
                if(marca.toLowerCase()==="kitekat"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Kitekat"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/FRxWJ21q/kitekat.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/L6GThHN5/kitekatinfo.png"
                    datasource.datos.color="#769E26"
                    datasource.datos.colorHeader="red"
                    
                }else if(marca.toLowerCase()==="minino plus"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Minino Plus"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/4xRvvWtQ/mininoplus.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/WprwDRq1/mininoplusinfo.png"
                    datasource.datos.color="#8D8D99"
                    datasource.datos.colorHeader="orange"
                    
                }else if(marca.toLowerCase()==="nucat"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Nucat"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/SQCk8c56/nucat.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/L5w1rLtB/nucatinfo.png"
                    datasource.datos.color="#ED61A7"
                    datasource.datos.colorHeader="#5B9922"
                    
                }else if(marca.toLowerCase()==="purina cat chow"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina Cat Chow"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/rmwpVsgd/catchow.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/T2ZW9jCC/catchowinfo.png"
                    datasource.datos.color="#1975D1"
                    datasource.datos.colorHeader="#F0B811"
                    
                }else if(marca.toLowerCase()==="gatina"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Gatina"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/Qt8z2bFG/gatina.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/BnxMJVPL/gatinainfo.png"
                    datasource.datos.color="#D93A00"
                    datasource.datos.colorHeader="#8D6A11"
                    
                }else if(marca.toLowerCase()==="purina felix"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina Felix"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/V66vHB45/purinafelix.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/PxrdKWTJ/purinafelixinfo.png"
                    datasource.datos.color="#427AA8"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="whiskas"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Whiskas"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/vHQYCY3C/whiskas.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/Zq17yqWR/whiskasinfo.png"
                    datasource.datos.color="#C701C1"
                    datasource.datos.colorHeader="#717063"
                    
                }else if(marca.toLowerCase()==="purina felix gatitos"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina Felix Gatitos"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/3xxm9Zg0/purinafelixgatitos.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/bYLBvmNs/felixgatitosinfo.png"
                    datasource.datos.color="#427AA8"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="whiskas gatitos"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Whiskas Gatitos"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/9FYnNTMH/whiskasgatitos.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/BvSsV4sM/whiskasgatitosinfo.png"
                    datasource.datos.color="#8A61BA"
                    datasource.datos.colorHeader="orange"
                    
                }else if(marca.toLowerCase()==="purina pro plan kitten"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina pro plan kitten"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/CKDc5jsz/proplangatito.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/ZR6YwDF4/proplangatitoinfo.png"
                    datasource.datos.color="#0099CC"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="purina pro plan adult"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Purina pro plan Adulto"
                    datasource.datos.subtitleHeader="Alimento balanceado!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/9fKycWbY/proplanadult.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/HLDBt9Dg/proplaninfo.png"
                    datasource.datos.color="#B22222"
                    datasource.datos.colorHeader="#000000"
                    
                }else if(marca.toLowerCase()==="grancat"){
                    DOCUMENT_ID="whiskasgatitos"
                    datasource.datos.titleHeader="Grancat"
                    datasource.datos.subtitleHeader="No es veraz!"
                    datasource.datos.bolsaAlimento="https://i.postimg.cc/fRVcvLvc/grancat.png"
                    datasource.datos.infoAlimento="https://i.postimg.cc/fRQHkYs3/grancatinfo.png"
                    datasource.datos.color="#FFA07A"
                    datasource.datos.colorHeader="#00D8FF"
                }
                
                const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
                // add the RenderDocument directive to the responseBuilder
                handlerInput.responseBuilder.addDirective(aplDirective);
                
            }
        }
        
        
        const speakOutput = informacionAlimento;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CompraIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'compraIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('recomen');
        
        let id = "recompra"
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(id);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const UsoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'usoIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('uso');
        
        let id = "uso1"
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(id);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const porcionesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'porcionesIntent';
    },
    handle(handlerInput) {
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        let edad = intent.slots.anios.value;
        let peso = intent.slots.peso.value;
        let nombre = intent.slots.nombre.value;
        let speakOutput;
        
        
        peso = parseFloat(peso)
        edad = parseFloat(edad)
        
        let etapa =""
        let id = "misporciones"
        
        if(edad > 18 && peso > 15){
            speakOutput ="¿Estas seguro de que es la edad y peso correcto, verifique su respuesta por favor?"
            
        }else if(edad>=0 && edad <=0.6){
            sessionAttributes['peso']=peso
            sessionAttributes['edad']=edad
            sessionAttributes['nombre']=nombre
            etapa="Gatito"
            speakOutput="Los gatitos pequeños necesitan un mayor aporte de proteínas y otros nutrientes. Debes repartir su alimentación en 5 tomas al día aproximadamente de entre 25 y 30 gramos cada una"
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter="Debes repartir su alimentación en 5 tomas al día aproximadamente de entre 25 y 30 gramos cada una"
            datasource4.data.imagen="https://images.unsplash.com/photo-1593288942460-e321b92a6cde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80"
                    
        }else if(edad > 0.6 && edad <= 2){
            sessionAttributes['peso']=peso
            sessionAttributes['edad']=edad
            sessionAttributes['nombre']=nombre
            
            etapa="Gato Joven"
            let r1=peso*0.2*100
            r1= r1.toFixed(2)
            let r2=peso*0.4*100
            r2= r2.toFixed(2)
            speakOutput=`Los gatos jovenes necesitan más cantidad de comida que un gatito. Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter=`Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            datasource4.data.imagen="https://img.freepik.com/fotos-premium/parque-sentado-gato-joven-rayado-gato-gris-rayado-ojos-verdes-posa-camara_553022-991.jpg?w=2000"
            
            
        }else if(edad > 2 && edad <= 7){
            
            sessionAttributes['peso']=peso
            sessionAttributes['edad']=edad
            sessionAttributes['nombre']=nombre
            etapa="Adulto"
            let r1=peso*0.2*100
            r1= r1.toFixed(2)
            let r2=peso*0.4*100
            r2= r2.toFixed(2)
            speakOutput=`Los gatos Adultos necesitan cantidades similares a las de un gato joven. Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter=`Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            datasource4.data.imagen="https://estaticos-cdn.prensaiberica.es/clip/8eb766d0-6e29-4aeb-ae49-7d99590ca585_16-9-discover-aspect-ratio_default_0.jpg"
            
        }else if(edad > 7 ){
            
            sessionAttributes['peso']=peso
            sessionAttributes['edad']=edad
            sessionAttributes['nombre']=nombre
            
            etapa ="Senior"
            let r1=peso*0.2*100
            r1= r1.toFixed(2)
            let r2=peso*0.4*100
            r2= r2.toFixed(2)
            speakOutput=`Los gatos sénior tienen más de 7 años, solo necesitaran dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una. Necesitan un régimen de alimentación muy parecido al de los gatos adultos. Sin embargo, hay una diferencia, pues la dieta necesita adaptarse a sus necesidades de forma que puedan seguir manteniéndose sanos.`
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter=`Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            datasource4.data.imagen="https://clinvet.cl/wp-content/uploads/2021/04/Cuidado-de-gato-senior-1024x683.jpg"
            
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(id, datasource4);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        
        if(speakOutput!== "¿Estas seguro de que es la edad y peso correcto, verifique su respuesta por favor?"){
            speakOutput=speakOutput+` He guardado las porciones de tu amigo felino ${nombre}, de ahora en adelante prueba decir "mis porciones" para recordarte las porciones de alimento necesarias.`
            
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const misporcionesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'misporciones';
    },
    handle(handlerInput) {
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        let speakOutput;
        let peso = sessionAttributes['peso']
        let edad = sessionAttributes['edad']
        let nombre = sessionAttributes['nombre']
        
        peso = parseFloat(peso)
        edad = parseFloat(edad)
        
        let etapa =""
        let id = "misporciones"
        
        if(edad>=0 && edad <=0.6){
            etapa="Gatito"
            speakOutput="Los gatitos pequeños necesitan un mayor aporte de proteínas y otros nutrientes. Debes repartir su alimentación en 5 tomas al día aproximadamente de entre 25 y 30 gramos cada una"
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter="Debes repartir su alimentación en 5 tomas al día aproximadamente de entre 25 y 30 gramos cada una"
            datasource4.data.imagen="https://images.unsplash.com/photo-1593288942460-e321b92a6cde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D&w=1000&q=80"
                    
        }else if(edad > 0.6 && edad <= 2){
            etapa="Gato Joven"
            let r1=peso*0.2*100
            r1= r1.toFixed(2)
            let r2=peso*0.4*100
            r2= r2.toFixed(2)
            speakOutput=`Los gatos jovenes necesitan más cantidad de comida que un gatito. Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter=`Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            datasource4.data.imagen="https://img.freepik.com/fotos-premium/parque-sentado-gato-joven-rayado-gato-gris-rayado-ojos-verdes-posa-camara_553022-991.jpg?w=2000"
            
            
        }else if(edad > 2 && edad <= 7){
            etapa="Adulto"
            let r1=peso*0.2*100
            r1= r1.toFixed(2)
            let r2=peso*0.4*100
            r2= r2.toFixed(2)
            speakOutput=`Los gatos Adultos necesitan cantidades similares a las de un gato joven. Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter=`Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            datasource4.data.imagen="https://estaticos-cdn.prensaiberica.es/clip/8eb766d0-6e29-4aeb-ae49-7d99590ca585_16-9-discover-aspect-ratio_default_0.jpg"
            
        }else if(edad > 7 ){
            etapa ="Senior"
            let r1=peso*0.2*100
            r1= r1.toFixed(2)
            let r2=peso*0.4*100
            r2= r2.toFixed(2)
            speakOutput=`Los gatos sénior tienen más de 7 años, solo necesitaran dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una. Necesitan un régimen de alimentación muy parecido al de los gatos adultos. Sin embargo, hay una diferencia, pues la dieta necesita adaptarse a sus necesidades de forma que puedan seguir manteniéndose sanos.`
            
            datasource4.data.titleHeader=`Porciones de Alimento para mi gato ${nombre}`
            datasource4.data.subtitleHeader=`Etapa: ${etapa}`
            datasource4.data.textFooter=`Por lo general, solo necesitará dos tomas diarias que deben contener entre ${r1} y ${r2} gramos de alimento cada una.`
            datasource4.data.imagen="https://clinvet.cl/wp-content/uploads/2021/04/Cuidado-de-gato-senior-1024x683.jpg"
            
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(id, datasource4);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(`tu gato ${nombre} esta en la etapa ${etapa} `+ speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('help');
        
        let id = "help"
        
        if(speakOutput==='Do you need assistance? You can tell me something like: "kitekat brand cat croquettes"'){
            datasource2.data.titleHeader="Do you need help?"
            datasource2.data.subtitleHeader="The best information about cat food."
            datasource2.data.textFooter="You can tell me something like: 'whiskas brand cat croquettes,' 'buying recommendations,' or 'usage recommendation"
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(id, datasource2);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('cancelacion');
        
        if(speakOutput==="ok, see you later"){
            datasource3.data.titleHeader="Ok, See You Later"
            datasource3.data.textFooter="Goodbye"
        }
        
        let id = "stop"
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            const aplDirective = createDirectivePayload(id,datasource3);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('fallback');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Ya iniciaste ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Lo siento, no he entendido lo que dijiste';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LoggingRequestInterceptor = {
    process(handlerInput){
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    }
};

const LoggingResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
};

const LocalizationInterceptor = {
    process(handlerInput) {
        const LocalizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            fallbackLng: 'en',
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true
        });
        
        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function(...args){
            return LocalizationClient.t(...args);
        }
    }
};

const LoadAttributesRequestInterceptor = {
    async process(handlerInput) {
        if(handlerInput.requestEnvelope.session['new']){ //is this a new session?
            const {attributesManager} = handlerInput;
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            //copy persistent attribute to session attributes
            handlerInput.attributesManager.setSessionAttributes(persistentAttributes);
        }
    }
};

const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        const {attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const shouldEndSession = (typeof response.shouldEndSession === "undefined" ? true : response.shouldEndSession);//is this a session end?
        if(shouldEndSession || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') { // skill was stopped or timed out            
            attributesManager.setPersistentAttributes(sessionAttributes);
            await attributesManager.savePersistentAttributes();
        }
    }
};
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        porcionesIntentHandler,
        misporcionesIntentHandler,
        MarcaIntentHandler,
        CompraIntentHandler,
        UsoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(LoggingRequestInterceptor, LocalizationInterceptor, LoadAttributesRequestInterceptor)
    .addResponseInterceptors(LoggingResponseInterceptor, SaveAttributesResponseInterceptor)
    .withPersistenceAdapter(persistenceAdapter)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();