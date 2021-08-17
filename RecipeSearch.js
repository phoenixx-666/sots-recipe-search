// Search for all nonoverlapping inclusions in a string
String.prototype.indicesOf = function(searchValue, fromIndex) {
    if (searchValue == '')
        return [];
    fromIndex = fromIndex || 0;
    var indices = [];
    for (var i = fromIndex; i < this.length - searchValue.length + 1; i++) {
        if (this.substring(i, i + searchValue.length) == searchValue) {
            indices.push(i);
            i += searchValue.length - 1;
        }
    }
    return indices;
};

$(document).ready(function() {
    $('#RecipeSearchBarWrapper').remove();
    
    if ($('h1.page-header__title').text().indexOf('Recipes') == -1)
        return;

    var $navbarWrapper = $('div.fandom-sticky-header'),
        $searchbarWrapper = $('<div></div>'),
        $searchbar = $('<div></div>'),
        $searchbarInner = $('<div></div>'),
        $searchbarTip = $('<div></div>'),
        $searchBox = $('<input />'),
        $clearBtn = $('<input />'),
        navbarHeight = $navbarWrapper.height(),
        tipAll = '(<span style="font-style:italic">Showing all possible recipes</span>)';
    
    $searchBox.attr({
        'type': 'text',
    });
    $searchBox.css({
        'font-family': 'Helvetica,Arial,sans-serif',
        'font-size': '100%',
        'font-weight': 'bold',
        'margin': '0 10px',
    });
    
    $clearBtn.attr({
        'type': 'button',
        'value': '✕',
    });
    
    $searchbarInner.css({
        'font-size': '125%',
        'font-weight': 'bold',
        'padding-bottom': '10px',
    });
    $searchbarInner.append('<span>Enter Ingredient or Recipe Name:</span>');
    $searchbarInner.append($searchBox);
    $searchbarInner.append($clearBtn);
    
    $searchbarTip.css({
        'text-align': 'center',
    });
    $searchbarTip.html(tipAll);
    
    $searchbar.css({
        'background-color': 'black',
        'border': '1px solid white',
        'border-top': '0',
        'display': 'inline-block',
        'padding': '15px',
    });
    $searchbar.append($searchbarInner);
    $searchbar.append($searchbarTip);
    
    $searchbarWrapper.attr({
        'id': 'RecipeSearchBarWrapper',
    });
    $searchbarWrapper.css({
        'position': 'fixed',
        'top': 0,
        'width': '100%',
        'z-index': 1000,
        'text-align': 'center',
        'color': 'white',
    });

    $searchbarWrapper.append($searchbar);
    $searchbarWrapper.insertAfter($navbarWrapper);

    var $cookerHeader = $('#Cooker').closest('h2'),
        $cooker = $cookerHeader.nextAll('table').first(),
        $cookerText = $cookerHeader.nextUntil($cooker),
        
        $labHeader = $('#Lab').closest('h2'),
        $lab = $labHeader.nextAll('table').first(),
        $labText = $labHeader.nextUntil($lab),
        
        $purifierHeader = $('#Purifier').closest('h2'),
        $purifier = $purifierHeader.nextAll('table').first(),
        $purifierText = $purifierHeader.nextUntil($purifier),
        
        texts = [$cookerText, $labText, $purifierText],
        tables = [$cooker, $lab, $purifier];
    
    $cooker.tableKey = 'cooker';
    $lab.tableKey = 'lab';
    $purifier.tableKey = 'purifier';
    
    var timeoutHandler = undefined;
        inputHandler = function(e) {
        var query = $searchBox.val().trim().toLowerCase(),
            qlen = query.length,
            $previous = null;
        
        $([document.documentElement, document.body]).animate({
            scrollTop: $cookerHeader.offset().top - navbarHeight
        }, 0);

        if (qlen) {
            texts.forEach($text => $text.hide());
            
            var nFound = {
                'cooker': 0,
                'lab': 0,
                'purifier': 0,
                'total': 0,
            };
            
            tables.forEach($table => {
                $table.find('tr').each(function(i, e) {
                    if (i == 0) return true;
                    
                    var $elem = $(e);
                    if ($elem.children('th,td').length > 1) {
                        var found = false;
                    
                        $elem.children('th,td').each(function(i, e) {
                            var $elem = $(e).find('div.recipe_image_caption>a'),
                                text = $elem.text(),
                                pos = text.toLowerCase().indicesOf(query);
                            if(pos.length > 0) {
                                var highlight = text.substring(0, pos[0]);
                                pos.forEach((p, i) => {
                                    highlight += '<span style="background-color:yellow;color:black">' +
                                        text.substring(p, p + qlen) + '</span>' +
                                        text.substring(p + qlen,
                                            (i < pos.length - 1 ? pos[i + 1]: text.length));
                                });
                                $elem.html(highlight);
                                found = true;
                            } else if ($elem.html() != text) {
                                $elem.text(text);
                            }
                        });
                        
                        if (found) {
                            $elem.show();
                            nFound[$table.tableKey]++;
                            nFound.total++;
                        } else {
                            $elem.hide();
                        }
                        $previous = $elem;
    
                    } else if ($previous) {
                        $elem.toggle(!$previous.is(':hidden'));
                    }
                });
            });
            
            $searchbarTip.html('(Found Recipes: Cooker ' + nFound.cooker +
                ', Lab ' + nFound.lab + ', Purifier ' + nFound.purifier + ', Total ' + nFound.total + ')');
        } else {
            $searchbarTip.html(tipAll);
            texts.forEach($text => $text.show());
            tables.forEach($table => {
                $table.find('tr').show();
                $table.find('div.recipe_image_caption>a').each((i, e) => {
                    var text = e.textContent;
                    if (text != e.innerHTML)
                        e.innerHTML = text;
                });
            });
        }
    };
    $searchBox.on('input', function() {
        if (timeoutHandler !== undefined)
            window.clearTimeout(timeoutHandler);
        timeoutHandler = window.setTimeout(inputHandler, 375);
    });
    
    $clearBtn.on('click', function() {
        var trigger = $searchBox.val().trim() != '';
        $searchBox.val('');
        if (trigger)
            $searchBox.trigger('input');
    });
});
