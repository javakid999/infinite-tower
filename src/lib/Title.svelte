<script lang="ts">
    
    let frame = 0;
    const title_frames = [
        '* Infinite Tower *',
        '\\ Infinite Tower \\',
        '| Infinite Tower |',
        '/ Infinite Tower /',
        '- Infinite Tower -',
        '\\ Infinite Tower \\',
        '| Infinite Tower |',
        '/ Infinite Tower /',
        '- Infinite Tower -'
    ];

    setInterval(() => {
        let text = title_frames[frame];
        if (Math.random() < 0.2) {
            const e_pos = text.indexOf('e', Math.floor(Math.random() * 20))
            if (e_pos != -1) text = text.slice(0, e_pos) + '3' + text.slice(e_pos + 1)
        }
        if (Math.random() < 0.2) {
            const e_pos = text.toLowerCase().indexOf('i', Math.floor(Math.random() * 20))
            if (e_pos != -1) text = text.slice(0, e_pos) + '1' + text.slice(e_pos + 1)
        }
        if (Math.random() < 0.2) {
            const e_pos = text.indexOf(' ', Math.floor(Math.random() * 20))
            if (e_pos != -1) text = text.slice(0, e_pos) + '_' + text.slice(e_pos + 1)
        }
        if (Math.random() < 0.2) {
            const e_pos = text.indexOf('o', Math.floor(Math.random() * 20))
            if (e_pos != -1) text = text.slice(0, e_pos) + '0' + text.slice(e_pos + 1)
        }
        if (Math.random() < 0.2) {
            const e_pos = text.toLowerCase().indexOf('t', Math.floor(Math.random() * 20))
            if (e_pos != -1) text = text.slice(0, e_pos) + '7' + text.slice(e_pos + 1)
        }
        document.getElementById('title')!.textContent = text;
        frame = (frame == 8) ? 0 : frame+1
    }, 80)

</script>

<div id="title-container">
    <h1 id="title">* Infinite Tower *</h1>
</div>

<style>
    @font-face {
        font-family: 'dogicabold';
        src: url('../../fonts/dogica/TTF/dogicabold.ttf')
    }

    h1 {
        font-family: 'dogicabold';
        text-align: center;
        color: white;
    }
</style>