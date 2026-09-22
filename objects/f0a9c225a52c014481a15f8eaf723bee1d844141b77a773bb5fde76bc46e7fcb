// ============================================================
// EL HOYO - VALORES DE COMIDA
// ============================================================
//
// Modifica:
// - Hambre recuperada
// - Saturación
// - Penalización por comer carne/pescado crudo
//
// IMPORTANTE:
// El valor de "saturación" utilizado internamente es un
// multiplicador. En los comentarios indicamos la saturación
// final aproximada que buscamos.
//
// No modifica:
// - Manzana normal
// - Sandía
// - Bayas
// - Galletas
// - Miel
// - Carne podrida
// - Pez globo
// - Otros alimentos no indicados aquí
// ============================================================


ItemEvents.modification(event => {

    // ========================================================
    // FUNCIÓN AUXILIAR
    // ========================================================

    const ajustarComida = (id, nutricion, saturacion) => {

        event.modify(id, item => {
            item.setFood(nutricion, saturacion)
        })

    }


    // ========================================================
    // COMIDA COCINADA
    // ========================================================

    // Filete
    // 5 hambre = 2,5 muslitos
    // Saturación final aprox. = 5
    ajustarComida(
        "minecraft:cooked_beef",
        5,
        0.5
    )

    // Cerdo cocinado
    // 5 hambre = 2,5 muslitos
    // Saturación final aprox. = 5
    ajustarComida(
        "minecraft:cooked_porkchop",
        5,
        0.5
    )

    // Pollo cocinado
    // 4 hambre = 2 muslitos
    // Saturación final aprox. = 3,2
    ajustarComida(
        "minecraft:cooked_chicken",
        4,
        0.4
    )

    // Cordero cocinado
    // 4 hambre = 2 muslitos
    // Saturación final aprox. = 4
    ajustarComida(
        "minecraft:cooked_mutton",
        4,
        0.5
    )

    // Salmón cocinado
    // 4 hambre = 2 muslitos
    // Saturación final aprox. = 4
    ajustarComida(
        "minecraft:cooked_salmon",
        4,
        0.5
    )

    // Conejo cocinado
    // 4 hambre = 2 muslitos
    // Saturación final aprox. = 3,2
    ajustarComida(
        "minecraft:cooked_rabbit",
        4,
        0.4
    )

    // Bacalao cocinado
    // 4 hambre = 2 muslitos
    // Saturación final aprox. = 3,2
    ajustarComida(
        "minecraft:cooked_cod",
        4,
        0.4
    )


    // ========================================================
    // CULTIVOS Y COMIDA BÁSICA
    // ========================================================

    // Pan
    // 3 hambre = 1,5 muslitos
    // Saturación final aprox. = 2,4
    ajustarComida(
        "minecraft:bread",
        3,
        0.4
    )

    // Patata asada
    // 3 hambre = 1,5 muslitos
    // Saturación final aprox. = 2,4
    ajustarComida(
        "minecraft:baked_potato",
        3,
        0.4
    )

    // Zanahoria
    // 2 hambre = 1 muslito
    // Saturación final aprox. = 1,2
    ajustarComida(
        "minecraft:carrot",
        2,
        0.3
    )

    // Remolacha
    // 1 hambre = 0,5 muslitos
    // Saturación final aprox. = 0,6
    ajustarComida(
        "minecraft:beetroot",
        1,
        0.3
    )


    // ========================================================
    // PLATOS ELABORADOS
    // ========================================================

    // Sopa de remolacha
    // 5 hambre = 2,5 muslitos
    // Saturación final aprox. = 4
    ajustarComida(
        "minecraft:beetroot_soup",
        5,
        0.4
    )

    // Estofado de champiñones
    // 5 hambre = 2,5 muslitos
    // Saturación final aprox. = 5
    ajustarComida(
        "minecraft:mushroom_stew",
        5,
        0.5
    )

    // Estofado de conejo
    // 6 hambre = 3 muslitos
    // Saturación final aprox. = 7,2
    ajustarComida(
        "minecraft:rabbit_stew",
        6,
        0.6
    )


    // ========================================================
    // COMIDAS PREMIUM
    // ========================================================
    //
    // Estas comidas serán principalmente recompensas
    // o productos de tiendas NPC.
    // ========================================================

    // Zanahoria dorada
    // 8 hambre = 4 muslitos
    // Saturación final aprox. = 16
    ajustarComida(
        "minecraft:golden_carrot",
        8,
        1.0
    )

    // Manzana dorada
    // 6 hambre = 3 muslitos
    // Saturación final aprox. = 12
    ajustarComida(
        "minecraft:golden_apple",
        6,
        1.0
    )

    // Manzana dorada encantada
    // 8 hambre = 4 muslitos
    // Saturación final aprox. = 16
    ajustarComida(
        "minecraft:enchanted_golden_apple",
        8,
        1.0
    )


    // ========================================================
    // CARNE CRUDA
    // ========================================================
    //
    // 80 % de probabilidad de Hambre durante 30 segundos.
    // Hambre I.
    //
    // Todas quedan en:
    // 2 hambre = 1 muslito
    // Saturación final aprox. = 0,6
    // ========================================================

    const carnesCrudas = [
        "minecraft:beef",
        "minecraft:porkchop",
        "minecraft:mutton",
        "minecraft:rabbit"
    ]

    carnesCrudas.forEach(id => {

        event.modify(id, item => {

            item.setFood(2, 0.15)

            item.modifyFood(food => {
                food.effect(
                    "minecraft:hunger",
                    600,
                    0,
                    0.8
                )
            })

        })

    })


    // ========================================================
    // POLLO CRUDO
    // ========================================================
    //
    // Vanilla ya tiene posibilidad de Hambre.
    // Quitamos ese efecto y ponemos nuestra regla:
    // 80 % durante 30 segundos.
    // ========================================================

    event.modify("minecraft:chicken", item => {

        item.setFood(2, 0.15)

        item.modifyFood(food => {

            food.removeEffect("minecraft:hunger")

            food.effect(
                "minecraft:hunger",
                600,
                0,
                0.8
            )

        })

    })


    // ========================================================
    // PESCADO CRUDO
    // ========================================================
    //
    // 60 % de probabilidad de Hambre durante 20 segundos.
    // ========================================================

    const pescadosCrudos = [
        "minecraft:cod",
        "minecraft:salmon"
    ]

    pescadosCrudos.forEach(id => {

        event.modify(id, item => {

            // 2 hambre = 1 muslito
            // Saturación final aprox. = 0,4
            item.setFood(2, 0.1)

            item.modifyFood(food => {
                food.effect(
                    "minecraft:hunger",
                    400,
                    0,
                    0.6
                )
            })

        })

    })


    // ========================================================
    // PEZ TROPICAL
    // ========================================================

    event.modify("minecraft:tropical_fish", item => {

        // 1 hambre = 0,5 muslitos
        // Saturación final aprox. = 0,2
        item.setFood(1, 0.1)

        item.modifyFood(food => {
            food.effect(
                "minecraft:hunger",
                400,
                0,
                0.6
            )
        })

    })

})