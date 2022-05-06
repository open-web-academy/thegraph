import { near, BigInt, json, JSONValueKind, log } from "@graphprotocol/graph-ts"
import { Product } from "../generated/schema"

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(
      actions[i],
      receipt.receipt,
      receipt.block.header,
      receipt.outcome,
      receipt.receipt.signerPublicKey
    );
  }
}

function handleAction(
  action: near.ActionValue,
  receipt: near.ActionReceipt,
  blockHeader: near.BlockHeader,
  outcome: near.ExecutionOutcome,
  publicKey: near.PublicKey,

): void {
  
  if (action.kind !== near.ActionKind.FUNCTION_CALL) {
    log.info("Early return: {}", ["Not a function call"]);
    return;
  }

  const functionCall = action.toFunctionCall();

  if(functionCall.methodName == "set_products"){
    log.info('Entro a agregar productos',[])
    //Obtencion del dato bruto del contrato
    let jsonData = outcome.logs[0]
    //Conversion del dato del contrato a JSON
    let parsedJSON = json.fromString(jsonData)
    let address = ""
    let name = ""
    let price = ""
    let stock = ""
    let enabled = true
    //Verificacion si el JSON es formato Objeto
    if(parsedJSON.kind == JSONValueKind.OBJECT){
      let entry = parsedJSON.toObject()
      //Recorrido de los diferentes valores en el JSON
      for(let i = 0;i < entry.entries.length; i++){
        let key = entry.entries[i].key.toString()
        log.info('key:{}',[key])
        //Asignacion de los valores del JSON
        switch(true){
          case key == 'address':
            address = entry.entries[i].value.toString()
            break
          case key == 'name':
            name = entry.entries[i].value.toString()
            break
          case key == 'price':
            price = entry.entries[i].value.toI64().toString()
            break
          case key == 'stock':
            stock = entry.entries[i].value.toI64().toString()
            break
          case key == 'enabled':
            enabled =  entry.entries[i].value.toBool()
            break
        }
      }
    }
    //Declaracion de la nueva entidad
    let product = new Product(address)
    //Asignacion de valores a la entidad
    product.name = name
    product.price = BigInt.fromString(price)
    product.stock = BigInt.fromString(stock)
    product.enabled = enabled
    //Se guardan los cambios en la entidad
    product.save()
    log.info('Se guardo el producto',[])
  }

  if(functionCall.methodName == "delete_products"){
    log.info('Entro a agregar productos',[])
    //Obtencion del dato bruto del contrato
    let jsonData = outcome.logs[0]
    //Conversion del dato del contrato a JSON
    let parsedJSON = json.fromString(jsonData)
    let address = ""
    let name = ""
    let price = ""
    let stock = ""
    let enabled = true
    //Verificacion si el JSON es formato Objeto
    if(parsedJSON.kind == JSONValueKind.OBJECT){
      let entry = parsedJSON.toObject()
      //Recorrido de los diferentes valores en el JSON
      for(let i = 0;i < entry.entries.length; i++){
        let key = entry.entries[i].key.toString()
        log.info('key:{}',[key])
        //Asignacion de los valores del JSON
        switch(true){
          case key == 'address':
            address = entry.entries[i].value.toString()
            break
          case key == 'name':
            name = entry.entries[i].value.toString()
            break
          case key == 'price':
            price = entry.entries[i].value.toI64().toString()
            break
          case key == 'stock':
            stock = entry.entries[i].value.toI64().toString()
            break
          case key == 'enabled':
            enabled =  entry.entries[i].value.toBool()
            break
        }
      }
    }
    //Busqueda de la entidad ya guardada
    let product = Product.load(address)
    //Verificacion de si la entidad existe
    if(product == null){
      //Si no existe se crea la entidad con la informacion de la transaccion
      product = new Product(address)
      product.name = name
      product.price = BigInt.fromString(price)
      product.stock = BigInt.fromString(stock)
      product.enabled = enabled
    }
    //Se actualiza el dato a modificar
    product.enabled = false
    product.save()
    log.info('Se modifico el producto',[])
  }
}