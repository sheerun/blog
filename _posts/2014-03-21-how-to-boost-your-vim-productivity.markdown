---
layout: post
title: How to boost your Vim productivity
---

## I. Space is your Leader

`Leader` is an awesome idea. It allows for executing actions by key *sequences* instead of key *combinations*. Because I'm using it, I rarely need to press `Ctrl`-something combo to make things work.

For long time I used `,` as my `Leader` key. Then, I realized I can map it to most prominent key on my keyboard. Space.

```
let mapleader = "\<Space>"
```

This turned my Vim life upside down. Now I can press `Leader` with both of my thumbs, and my fingers are always on home row. `Leader` became so easy to use I began to notorously use it in various keybindings.

## II. Map your most frequent actions to Leader

I identified the actions that consumed most of my time while working in Vim. I mapped them them using `Leader` key. Among others I decided to:

#### Type `<Space>o` to open a new file:

```
nnoremap <Leader>o :CtrlP<CR>
```

#### Type `<Space>w` to save file (lot faster than `:w<Enter>`):

```
nnoremap <Leader>w :w<CR>
```

#### Copy & paste to system clipboard with `<Space>p` and `<Space>y`:

```
vmap <Leader>y "+y
vmap <Leader>d "+d
nmap <Leader>p "+p
nmap <Leader>P "+P
vmap <Leader>p "+p
vmap <Leader>P "+P
```

#### Enter visual line mode with `<Space><Space>`:

```
nmap <Leader><Leader> V
```

I encourage you to identify **your** most frequent actions, and map them.

## III. Use region expanding

I use [terryma/vim-expand-region](https://github.com/terryma/vim-expand-region) with following mapping:

```
vmap v <Plug>(expand_region_expand)
vmap <C-v> <Plug>(expand_region_shrink)
```

It allows me to:

* Hit `v` to select one character
* Hit `v`again to expand selection to word
* Hit `v` again to expand to paragraph
* ...
* Hit `<C-v>` go back to previous selection if I went too far

It seems like `vvv` is slower than `vp` but in practice I don’t need to think beforehand what to select, and what key combination to use.

This way `v` replaces `viw`, `vaw`, `vi"`, `va"`, `vi(`, `va(`, `vi[`, `va[`, `vi{`, `va{`, `vip`, `vap`, `vit`, `vat`, ... you get the idea.

## IV. Discover text search object

I never really enjoyed search-and-replace in Vim until I found following snippet on [Vim wiki](http://vim.wikia.com/wiki/Copy_or_change_search_hit):

```
vnoremap <silent> s //e<C-r>=&selection=='exclusive'?'+1':''<CR><CR>
    \:<C-u>call histdel('search',-1)<Bar>let @/=histget('search',-1)<CR>gv
omap s :normal vs<CR>
```
It allows me for following search-and-replace flow:

* I search things usual way using `/something`
* I hit `cs`, replace first match, and hit `<Esc>`
* I hit `n.n.n.n.n.` reviewing and replacing all matches

P.S. An altenative is to use [`cgn` from Vim 7.4](http://vimcasts.org/episodes/operating-on-search-matches-using-gn/).

## V. Invent more awesome key mappings

I use following shortcuts on day-to-day basis. They saved me months.

#### Automatically jump to end of text you pasted:

I can paste multiple lines multiple times with simple `ppppp`.

```
vnoremap <silent> y y`]
vnoremap <silent> p p`]
nnoremap <silent> p p`]
```

#### Prevent replacing paste buffer on paste:

I can select some text and paste over it without worrying my paste buffer is replaced by just just removed text (place it close to end of `~/vimrc`).

```
" vp doesn't replace paste buffer
function! RestoreRegister()
  let @" = s:restore_reg
  return ''
endfunction
function! s:Repl()
  let s:restore_reg = @"
  return "p@=RestoreRegister()\<cr>"
endfunction
vmap <silent> <expr> p <sid>Repl()
```

* Type `12<Enter>` to go to line 12 (`12G` breaks my wrist)
* Hit Enter to go to end of file.
* Hit Backspace to go to beginning of file.

```
nnoremap <CR> G
nnoremap <BS> gg
```

#### Quickly select text you just pasted:

```
noremap gV `[v`]
```

#### Stop that stupid window from popping up:

```
map q: :q
```


## VI. Make your unit testing experience seamless

I use [vim-vroom](https://github.com/skalnik/vim-vroom) and properly configured tmux for my tests.

Because `vim-room` uses `<Leader>r` for executing test suite, and I use `<Space>` as my Leader, I press `<Space>r`, and tests run next to me.

And because test are run in tmux *split*, I can always see my code, and run my tests while already developing next piece of it.

## VII. Use Ctrl-Z to switch back to Vim

I frequently need to execute random command in my shell. To achieve it I pause Vim by pressing `Ctrl-z`, type command and press `fg<Enter>` to switch back to Vim. 

The `fg` part really hurted me. I wanted to just hit  `Ctrl-z` once again to get back to Vim view. I couldn’t find any solution, so I developed my own which works wonderfully under ZSH:

```
fancy-ctrl-z () {
  if [[ $#BUFFER -eq 0 ]]; then
    fg
    zle redisplay
  else
    zle push-input
    zle clear-screen
  fi
}
zle -N fancy-ctrl-z
bindkey '^Z' fancy-ctrl-z
```

If you paste it to yoru `~/.zshrc`, you'll be able to switch back and forth between my shell and Vim **extremely** fast. Try it by yourself.

## VIII. Setup Tmux the Right Way

The Tmux + OSX + Vim combination is pretty hard because of:

* poor system clipboard handling
* difficult navigation between Vim and Tmux windows
* difficult execution of tmux commands (`C-b`)
* hard to use copy mode in tmux

I spent quite a long time to tune it correctly and here are the results:

#### Bind `<C-Space>` as your new tmux prefix.

Some people use `<C-a>` mapping, but I use this shortcut to go to beginning of line, so it's out of scope. Plus `<C-Space>` plays much better with bindings I describe later.

```
unbind C-b
set -g prefix C-Space
bind Space send-prefix
```

#### Bind `<Space>` to enter copy mode.

Think about it. `<C-Space><Space>` takes you directly to copy mode in tmux.

```
bind Space copy-mode
bind C-Space copy-mode
```

#### Use `y` and `reattach-to-user-namespace` (on OSX)

For copying to system clipboard. You'll need to issue `brew install reattach-to-user-namespace` beforehand.

 
```
bind-key -t vi-copy y \
  copy-pipe "reattach-to-user-namespace pbcopy"
```

#### Use [vim-tmux-navigator](https://github.com/christoomey/vim-tmux-navigator)

So you can seamlessly switch between any combination of vim and tmux windows using `<C-h>`, `<C-j>`, `<C-k>`, `<C-l>`.

I also recomment to use following key bindings to split tmux window with `<C-Space>l` and  `<C-Space>j` with is admittedly faster than pressing `<C-Space>%` and `<C-Space>|`.

```
bind j split-window -v
bind C-j split-window -v

bind l split-window -h
bind C-l split-window -h
```

See my [tmux.conf](https://github.com/sheerun/dotfiles/blob/master/tmux.conf) for more good stuff.

## IX. Make Ctrl-P plugin lot faster for git projects

Put following to your `.vimrc`:

```
let g:ctrlp_user_command = ['.git', 'cd %s && git ls-files . -co --exclude-standard', 'find %s -type f']
let g:ctrlp_use_caching = 0
```

You recommend using [vim-scripts/gitignore](https://github.com/vim-scripts/gitignore).

## X. Use package manager

[neobundle.vim](https://github.com/Shougo/neobundle.vim) is awesome for managing my Vim plugins:

* You don't need to manually manage git submodules (pathogen)
* It installs & updates plugins **in parallel**
* It can **build** plugins like [YouCompleteMe](https://github.com/Valloric/YouCompleteMe):

```
NeoBundle 'Valloric/YouCompleteMe', {
      \ 'build' : {
      \     'mac' : './install.sh',
      \    },
      \ }
```

* Or fetch from custom paths like for [pry](https://github.com/Valloric/YouCompleteMe) plugin:

```
NeoBundle 'rking/pry-de', {'rtp': 'vim/'}
```

## XI. Take advantage from Vim plugins

Here are few general plugins I use that boost my productivity:

* [YouCompleteMe](https://github.com/Valloric/YouCompleteMe)
* [ack.vim](https://github.com/mileszs/ack.vim) (ag.vim is also good)
* [tpope/vim-commentary](https://github.com/tpope/vim-commentary)
* [tpope/vim-rsi](https://github.com/tpope/vim-rsi)
* [tpope/vim-endwise](https://github.com/tpope/vim-endwise)
* [tpope/vim-fugitive](https://github.com/tpope/vim-fugitive) mainly for `:Gblame`
* [tpope/vim-repeat](https://github.com/tpope/vim-repeat)
* [tpope/vim-sleuth](https://github.com/tpope/vim-sleuth)
* [mmozuras/vim-github-comment](https://github.com/mmozuras/vim-github-comment)
* [vim-airline](https://github.com/bling/vim-airline) with following config:

```
NeoBundle 'bling/vim-airline'
let g:airline_theme='powerlineish'
let g:airline_left_sep=''
let g:airline_right_sep=''
let g:airline_section_z=''
```

I am ruby developer, so I use Ruby some plugins:

* [tpope/vim-rails](https://github.com/tpope/vim-rails)
* [vim-textobj-rubyblock](https://github.com/nelstrom/vim-textobj-rubyblock) (`var`, `vir` for selecting ruby blocks)
* [ruby_pry](https://github.com/rking/pry-de/blob/master/vim/ftplugin/ruby_pry.vim)
* [AndrewRadev/splitjoin.vim](https://github.com/AndrewRadev/splitjoin.vim) with following key mapping:
```
nmap sj :SplitjoinSplit<cr>
nmap sk :SplitjoinJoin<cr>
```

## XII. Speed-up setup of Vim on your server

I often need to use vim on servers to configure them. Unfortunately vim doesn’t come out of the box with sensible defaults.

One can use [vim-sensible](https://github.com/tpope/vim-sensible) to achieve it but it was not enough for me. I developed [vimrc](https://github.com/sheerun/vimrc) plugin with really good defaults (especially for Ruby developer) that makes `~/.vimrc` a single source of vim configuration. It also includes better default scheme, package manger, and multi-language syntax support.

That means I don’t need to mangle `~/.vim` directory to configure vim on server-side. The installation of Vim environment on my server is as simple as:

```
git clone --recursive https://github.com/sheerun/vimrc.git ~/.vim
```

I also developed my [dotfiles](https://github.com/sheerun/dotfiles) so my  development environment can be set up within seconds at any time.

## Introspect!

The key to good Vim setup is continuous recognition of issues you encounter during your development and responding to them. 

The response can be quick mapping in the `.vimrc`, a google for solution, asking a question on IRC, you name it.

What boosts Your productivity in Vim?
