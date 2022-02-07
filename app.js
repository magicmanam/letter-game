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

pro.load.once('similar-words.html', function (view) {
    'use strict';

    pro.view.name('similar-words-view')(function () {
        return view.cloneNode(true);
    })
    .on(function (model) {
        this.out('hidden');
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
                            words.push(pattern.replace('*', letter));
                        });

                        let patternWithWords = { pattern: pattern, words: words.join(',').replaceAll(',', ', '), wordsArray: words };
                        result.push(patternWithWords);
                        index.addPattern(patternWithWords);
                    });

                    viewModel.wordsList(result);
                });
            });
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

var index = new WordsIndex();

pro.tree.document();

function WordsIndex() {
    var index = { letters: {} };

    this.addPattern = function (pattern) {
        for (let i = 0; i < pattern.wordsArray.length; i++) {
            let word = pattern.wordsArray[i];

            let currentIndex = index;
            for (let j = 0; j < word.length; j++) {
                if (!currentIndex.letters[word[j]]) {
                    currentIndex.letters[word[j]] = { letters: {}, patterns: [] };
                }

                currentIndex = currentIndex.letters[word[j]];
            }

            //assumption is that all patterns are unique, so do not need to check that this pattern was not added before
            currentIndex.patterns.push(pattern);
        }
    };

    this.getIndex = function (prefix) {
        if (prefix) {
            let currentIndex = index;
            for (let i = 0; i < prefix.length; i++) {
                currentIndex = currentIndex.letters[prefix[i]];

                if (!currentIndex) {
                    return { letters: {}, patterns: [] };
                }
            }

            return currentIndex;
        }
        else {
            return index;
        }
    }
}
