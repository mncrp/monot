###### Monot - 開発者向けドキュメント
# 開発環境の準備

- [Node.jsのインストール](#Node.jsのインストール)
- [Gitのインストール](#Gitのインストール)
- [ソースコードの入手](#ソースコードの入手)
- [依存関係のインストール](#依存関係のインストール)
- [ビルドの実行](#ビルドの実行)
- [バイナリの実行](#バイナリの実行)

## Node.jsのインストール
### Windows
[こちらのサイト](https://nodejs.org/ja/download/)からインストーラーをダウンロード、実行します。

### Mac
上記のリンクからMac向けのバイナリをダウンロード、実行します。

### Linux
ディストリビューションごとにインストール方法が違います。
- Ubuntu:
  `sudo apt update && sudo apt install nodejs npm`

- Arch Linux:
  `sudo pacman -Sy nodejs`

- openSUSE:
  `zypper install nodejs`

インストールされたか確認するにはコマンドプロンプトやShellで`node --version`を実行します。

## Gitのインストール
Monotはソースコードの管理にGit、ホスティングにはGitHubを利用しています。

### Windows
[こちら](http://git-scm.com/download/win)のサイトからお使いのPCに合ったインストーラーをダウンロード、インストールして下さい。

### Mac
MacOSの場合、既にGitがインストールされている場合があります。`%git --version`をShellで実行して、Gitがインストール済みか確認して下さい。

もしGitがインストールされていない場合は[こちら](https://git-scm.com/download/mac)のサイトからインストーラーをダウンロード[^1]、実行して下さい。

### Linux
各ディストリビューションのパッケージマネージャを使ってGitをインストールして下さい。
- Ubuntu:
  `$sudo apt update && sudo apt install git`

- Arch Linux:
  `$sudo pacman -Sy git`

- openSUSE:
  `$zypper install git-core`

[^1]: インストーラーの代わりにHomebrewを使用してもインストールする事が出来ます。Homebrewがインストール済みの場合は、 `brew update` 、`brew install git`を実行して下さい。Homebrewは`/bin/bash -c "(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`でインストール出来ます。

## ソースコードの入手

任意のディレクトリで`git clone https://github.com/Sorakime/monot.git`を実行すると`./monot`ディレクトリが作成され、Monotのソースコードがダウンロードされます。[^2]

[^2]: 厳密には、Monotのリポジトリをローカル環境に複製したことになりますが、ここでは一旦ソースコードのダウンロードとします。

**以降このドキュメントではカレントディレクトリを`/monot`ディレクトリとします。**

### 依存関係のインストール
Monotのディレクトリに移動して、`npm run install`を実行すると依存関係が整理されます。

### ビルドの実行
`npm run build`を実行すると`electron-builder`が実行され、`./dist`配下に各OSに適した実行可能ファイルが生成されます。[^3]

[^3]: Windowsなら`.exe`ファイル、MacOSなら`.app`ファイル、Linuxなら`.AppImage`ファイルが生成されます。

### バイナリの実行
`./dist`配下に生成された実行可能ファイルをそれぞれのOSに合った方法で実行して下さい。

## Gitの使い方
Monot開発において主に使うGitコマンドは、以下の5つです。
- `git add`
- `git clone`
- `git commit`
- `git push`
- `git pull`

### 用語
このドキュメントでは、以下の用語を用いて解説しています。
- リポジトリ
  - リモートリポジトリ
  - ローカルリポジトリ

#### リポジトリ
IT用語辞典 e-wordsは、以下のように解説しています。
> ソフトウェア開発などに用いるプロジェクト管理システムやバージョン管理システムなどで、プロジェクトを構成するプログラムのソースコードやドキュメント、関連する各種のデータやファイルなどを一元的に管理する格納場所のことをリポジトリという。<br>
> 特に、データそのものに加えて版数や最終更新日時などデータについてのデータ（メタデータ）を記録・管理し、複数人がデータを矛盾なく共有する仕組みを備えたデータの管理システムや保管場所のことを指すことが多い。<br>
https://e-words.jp/w/%E3%83%AA%E3%83%9D%E3%82%B8%E3%83%88%E3%83%AA.html

##### リモートリポジトリ
この場合、[GitHub上のリポジトリ](https://github.com/Sorakime/monot)のこと。

##### ローカルリポジトリ
コンピュータ上に複製されたリポジトリのこと。

### `git add`
gitでは扱うファイルを予め決めておきます。
新しいファイルを作成したり、ファイルを削除したり、移動したりした場合に`git add .`とすることでその扱うファイルを更新できます。

### `git clone`
[ソースコードの入手](#ソースコードの入手)でも１度使ったように、リモートリポジトリ(ここではGitHub上のリポジトリ)をローカル環境に複製するコマンドです。

### `git commit`
現在のソースコードを変更履歴に残すコマンドです。
後述する`git push`をする場合、この`git commit`を行ってから`git push`しなければなりません。

### `git push`
ローカルリポジトリの変更点をリモートリポジトリにアップロードするコマンドです。
後述する`git pull`のほぼ反対のコマンドです。

### `git pull`
リモートリポジトリとローカルリポジトリとの差分を取り込むコマンドです。
ほかのメンバーが`git push`することでGitHubのリモートリポジトリが変更された後、`git pull`をすることでローカルリポジトリがリモートリポジトリと同期されます。
