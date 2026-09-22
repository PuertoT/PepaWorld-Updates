StartupEvents.registry('item', event => {

    event.create('nereasnack_ultimate')
        .displayName('Nereasnack Ultímate')
        .maxStackSize(8)
        .rarity('epic')
        .glow(true)
        .texture('kubejs:item/nereasnack_ultimate')
        .food(food => {
            food
                .nutrition(10)
                .saturation(1.5)
                .alwaysEdible()
        })
})