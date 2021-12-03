var app = new pro.Unit();

app.unit('letter-game')
    .out(function () {
        pro.http.to('api/words')
            .on(200, function (response) {
                response = JSON.parse(response.data);
                me.out('words-loaded', response);
            })
            .header('Content-Type', 'application/json')
            .get();
    });

pro.load.on('words-component.html', function (wordsContainer) {
    app.unit('words-list')
        .on('letter-game')
        .out(function (letterGame) {
            var me = this,
                viewModel = pro.data({ wordsList: [] });

            letterGame.on('words-loaded', function (data) {
                var result = [];

                const patterns = Object.keys(data);

                patterns.forEach((pattern) => {
                    let letters = data[pattern];
                    let words = [];

                    letters.forEach((letter, i) => {
                        words.push(pattern.replace('*', letters[i]));
                    });

                    result.push({ pattern: pattern, words: words.join(',') });
                });

                viewModel.wordsList(result);
            });

            pro.mvvm.to(wordsContainer, viewModel);
        });
});

app.unit('Toolbar')
    .on('letter-game')
    .out(function (letterGame) {
        letterGame.out('load-words');
    });

pro.load.once('similar-words.html', function (view) {
    'use strict';

    pro.view.name('similar-words-view')(function () {
        return view.cloneNode(true);
    })
    .on(function (model) {
        this.out('hidden');
    });
});

pro.tree.document();
