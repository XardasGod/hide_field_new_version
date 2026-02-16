export default class CardObserver{
    cardObserver = null;
    constructor(callback){
        this.callback = callback;
    }

    addCardObserver() {
        this.cardObserver && this.cardObserver.disconnect()

        this.cardObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.id === 'card_fields') { //поля карточки, значит произошла полная загузка карточки
                        this.callback()
                    }
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('button-input__saved')) { //если произошло нажатиле кнопки "сохранить"
                        this.callback()
                    }

                });
            });
        });
        const target = document.querySelector('#card_holder') //всегда присутствует на странице 
        this.cardObserver.observe(target, { childList: true, subtree: true });
    }

    renderDecorator() { //обсервер не всегда ставится через init по каким то причинам. Эта фунция-обертка для вствки в render.
        if (!this.cardObserver) {
            this.callback()
            this.addCardObserver()
        }
    }
}