function(instance, properties) {
    // 1. Configurações de Dimensão
    // Mesmo que o bubble defina, garantimos que o SVG se adapte
    var width = properties.bubble.width();
    var height = properties.bubble.height();
    
    // 2. Cores e Estilos
    var bg_color = "#F5F7FA"; // Cinza claro (Padrão)
    var border_color = "#CBD5E0";
    var text_color = "#4A5568"; // Cinza escuro
    var font_size = Math.min(width, height) * 0.55; // Fonte escala com o tamanho (55% do container)
    
    // 3. Lógica do Ícone
    var icon = "";
    
    // Verifica Erro primeiro
    if (!properties.element_id) {
        bg_color = "#FFF5F5"; // Vermelho claro
        border_color = "#FC8181"; // Borda vermelha
        text_color = "#C53030";   // Texto vermelho
        icon = "!"; // Ícone de alerta
    } 
    // Se não for erro, verifica o TIPO
    else if (properties.type === "Mask") {
        icon = "#"; // Representa Máscara/Números
        text_color = "#3182CE"; // Azul para destacar máscara
    } else {
        icon = "Aa"; // Representa Texto/Restrição
        text_color = "#38A169"; // Verde para destacar restrição
    }

    // 4. Construção do SVG Minimalista
    var svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="4" fill="${bg_color}" stroke="${border_color}" stroke-width="2"/>
        
        <text x="50%" y="50%" 
              dominant-baseline="middle" 
              text-anchor="middle" 
              font-family="Arial, sans-serif" 
              font-weight="bold" 
              font-size="${font_size}" 
              fill="${text_color}">
            ${icon}
        </text>
    </svg>
    `;

    // 5. Renderiza
    instance.canvas.append(svg);
    
    // CSS para centralizar perfeitamente no container do Bubble
    instance.canvas.css({
        "overflow": "hidden",
        "display": "flex",
        "align-items": "center",
        "justify-content": "center"
    });
}