function(instance, properties, context) {

    // --- LIMPEZA DA EXECUÇÃO ANTERIOR ---
    //
    // O Bubble roda o update de novo sempre que uma propriedade muda (por exemplo, quando
    // um condicional troca o element_id ou o modo). O listener precisa ser a MESMA função
    // que foi adicionada para removeEventListener funcionar, então ele fica guardado em
    // instance.data. Sem isso, cada update somava um listener, e um input reaproveitado por
    // um repeating group continuava obedecendo as regras da pergunta anterior.

    if (instance.data.boundElement && instance.data.boundHandler) {
        instance.data.boundElement.removeEventListener("input", instance.data.boundHandler);
    }
    instance.data.boundElement = null;
    instance.data.boundHandler = null;

    if (instance.data.retryTimer) {
        clearTimeout(instance.data.retryTimer);
        instance.data.retryTimer = null;
    }

    if (!properties.element_id) {
        return;
    }

    // --- FUNÇÕES AUXILIARES ---

    function applyMask(value, mask) {
        var i = 0;
        var maskedValue = '';

        // Limpa o valor para pegar apenas os dados brutos (alfanuméricos)
        var rawValue = value.replace(/[^a-zA-Z0-9]/g, "");

        // Se a máscara for apenas numérica, remove letras do input
        if (mask.indexOf('A') === -1 && mask.indexOf('S') === -1) {
            rawValue = value.replace(/[^0-9]/g, "");
        }

        for (var m = 0; m < mask.length; m++) {
            if (i >= rawValue.length) break;

            var maskChar = mask[m];
            var inputChar = rawValue[i];

            if (maskChar === '0') {
                if (/[0-9]/.test(inputChar)) { maskedValue += inputChar; i++; }
                else { i++; m--; }
            } else if (maskChar === 'A') {
                if (/[a-zA-Z]/.test(inputChar)) { maskedValue += inputChar; i++; }
                else { i++; m--; }
            } else if (maskChar === 'S') {
                if (/[a-zA-Z0-9]/.test(inputChar)) { maskedValue += inputChar; i++; }
                else { i++; m--; }
            } else {
                maskedValue += maskChar; // Caracteres fixos da máscara
            }
        }
        return maskedValue;
    }

    // --- LÓGICA PRINCIPAL ---

    function attach(element) {

        var handleInput = function() {
            var currentValue = element.value;
            var cleanValueResult = "";
            var isMaskValid = true; // Padrão é verdadeiro (para modo Restrict)

            // 1. MASK MODE
            if (properties.type === "Mask" && properties.mask) {
                var newValue = applyMask(currentValue, properties.mask);

                // Atualiza o input visualmente
                if (element.value !== newValue) {
                    element.value = newValue;
                }

                // Define o valor limpo
                cleanValueResult = newValue.replace(/[^a-zA-Z0-9]/g, "");

                // Verifica se o tamanho do valor final é igual ao tamanho da máscara exigida
                isMaskValid = newValue.length === properties.mask.length;
            }

            // 2. RESTRICT MODE
            else {
                var allowedChars = "";

                if (properties.allow_text) allowedChars += "a-zA-Z";
                if (properties.allow_numbers) allowedChars += "0-9";
                if (properties.allow_spaces) allowedChars += " ";
                if (properties.allow_hyphen) allowedChars += "\\-";

                if (properties.allow_special) {
                    allowedChars += "!@#$%^&*()_+={\\[}\\]|;:'\",.<>/?`~\\\\";
                }

                // Com nada permitido, "[^]" seria uma regex inválida; nesse caso apaga tudo.
                var regex = allowedChars ? new RegExp("[^" + allowedChars + "]", "g") : /[\s\S]/g;
                var restrictedValue = currentValue.replace(regex, "");

                if (element.value !== restrictedValue) {
                    element.value = restrictedValue;
                }

                cleanValueResult = restrictedValue;
                isMaskValid = true; // No modo restrição, consideramos sempre válido
            }

            // --- PUBLICAÇÃO DE STATES ---

            instance.publishState('character_count', element.value.length);
            instance.publishState('clean_value', cleanValueResult);
            instance.publishState('valid_mask', isMaskValid);
        };

        element.addEventListener("input", handleInput);
        instance.data.boundElement = element;
        instance.data.boundHandler = handleInput;

        // Executa uma vez ao carregar para validar valor inicial
        handleInput();
    }

    // --- LOCALIZAÇÃO DO INPUT ---
    //
    // O ID do input pode ser aplicado por um condicional depois que este update roda, então
    // um "não encontrado" na primeira tentativa não é definitivo. Tenta por até ~2s.

    var tries = 0;

    function find() {
        instance.data.retryTimer = null;
        var element = document.getElementById(properties.element_id);

        if (element) {
            attach(element);
        } else if (tries++ < 20) {
            instance.data.retryTimer = setTimeout(find, 100);
        } else {
            console.warn("Elemento " + properties.element_id + " não encontrado.");
        }
    }

    find();
}
