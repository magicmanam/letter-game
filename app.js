var app = new pro.Unit();

app.unit('letter-game')
    .out(function () {
        var me = this;

        pro.http.to('api/words')
            .on(200, function (response) {
                response = JSON.parse(response.data);
                me.out('words-loaded', response);
            })
            .header('Content-Type', 'application/json')
            .get();
    });

app.unit('Toolbar')
    .on('letter-game')
    .out(function (letterGame) {
        letterGame.out('load-words');
    });

pro.load.on('words-component.html', function (wordsContainer) {
    app.unit('words-list')
        .on('letter-game')
        .out(function (letterGame) {
            var me = this,
                viewModel = pro.data({ wordsList: [] });

            pro.mvvm.to(wordsContainer, viewModel);

            letterGame.on('words-loaded', function (data) {
                var result = [];

                const patterns = Object.keys(data);

                patterns.forEach((pattern) => {
                    let letters = data[pattern];
                    let words = [];

                    letters.forEach((letter, i) => {
                        words.push(pattern.replace('*', letters[i]));
                    });

                    result.push({ pattern: pattern, words: words.join(',').replaceAll(',', ', ') });
                });

                viewModel.wordsList(result);
            });
        });
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

pro.load.on('footer.html', function (footerContainer) {
    app.unit('words-stats')
        .on('letter-game')
        .out(function (letterGame) {
            var me = this,
                viewModel = pro.data({ totalWordsCount: '-', totalSetsCount: '-' });

            pro.mvvm.to(footerContainer, viewModel);

            letterGame.on('words-loaded', function (data) {
                var totalWords = 0;

                const patterns = Object.keys(data);
                let totalSets = patterns.length;

                patterns.forEach((pattern) => {
                    let letters = data[pattern];
                    totalWords += letters.length;
                });

                viewModel.totalWordsCount(totalWords);
                viewModel.totalSetsCount(totalSets);
            });
        });
});

pro.tree.document();
