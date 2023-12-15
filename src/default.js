const body = `Assistente
Bem vindo, o que quer fazer?
{balance.balance}
1 - ajuda
2 - teste
3 - Hugging Face`;

module.exports = cmd => {
    cmd.arguments({
        value: "number",
        dia: "string"
    })

    cmd.request("huggingFace", {
        method: "post",
        url: "https://api-inference.huggingface.co",
        headers: { Authorization: "Bearer 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" },
        body: JSON.stringify({
            inputs: "Can you please let us know more details about your ",
            parameters: {
                model: "gpt2",
            }
        })
    })

    cmd.request("balance",{
        method: "get",
        url: "https://verifiedscatacado.com/api/v2?key=d86e470375f56782f7cdc28dd04fc5a2&action=balance"
    })
    cmd.body = body

    cmd.callback("1", "ajuda")
    cmd.callback("2", "teste")
    cmd.callback("3", "huggingFace")
}