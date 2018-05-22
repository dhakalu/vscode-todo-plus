
/* IMPORT */

import * as vscode from 'vscode';
import CodeItem from '../items/code';
import CommentItem from '../items/comment';
import LineItem from '../items/line';
import ProjectItem from '../items/project';
import TodoItem from '../items/todo';
import Config from '../../config';
import Consts from '../../consts';
import Utils from '../../utils';
import Line from './line';

/* PROJECT */

const PROJECT_BASIC = vscode.window.createTextEditorDecorationType ({
  color: Consts.colors.project
});

const PROJECT_STATISTICS = () => ({
  color: Consts.colors.project,
  after: {
    contentText: undefined,
    color: Consts.colors.projectStatistics,
    margin: '0 5px 0 5px',
    textDecoration: ';font-size: .9em'
  }
});

const StatisticsTypes = {

  types: {},

  get ( contentText: string, textEditor: vscode.TextEditor ) {
    const decorations = PROJECT_STATISTICS ();
    decorations.after.contentText = contentText;
    const type = vscode.window.createTextEditorDecorationType ( decorations );
    const id = textEditor.document.uri.fsPath;
    if ( !StatisticsTypes.types[id] ) StatisticsTypes.types[id] = [];
    StatisticsTypes.types[id].push ( type );
    return type;
  },

  reset ( textEditor: vscode.TextEditor ) {
    const id = textEditor.document.uri.fsPath;
    if ( !StatisticsTypes.types[id] ) return;
    StatisticsTypes.types[id].forEach ( type => textEditor.setDecorations ( type, [] ) );
    StatisticsTypes.types[id] = [];
  }

};

class Project extends Line {

  TYPES = [PROJECT_BASIC];
  TYPES_STATISTICS = [];

  getItemRanges ( project: ProjectItem, negRange?: vscode.Range | vscode.Range[] ) {

    return [this.getRangesRegex ( project.startLine, Consts.regexes.project, Consts.regexes.tag, negRange )];

  }

  getDecorations ( items: ProjectItem[] | CodeItem[] | CommentItem[] | LineItem[], negRange?: vscode.Range | vscode.Range[] ) {

    if ( !Config.getKey ( 'statistics.project.enabled' ) ) return super.getDecorations ( items, negRange );

    const textEditor = items.length ? items[0].textEditor : vscode.window.activeTextEditor;

    StatisticsTypes.reset ( textEditor );

    if ( !items.length ) return [];

    const template = Config.getKey ( 'statistics.project.text' ),
          [ranges] = this.getRanges ( items, negRange );

    if ( !ranges ) return [];

    return ranges.map ( ( range, index ) => {

      const tokens = Utils.statistics.getTokensProject ( textEditor, range.start.line ),
            contentText = Utils.statistics.renderTemplate ( template, tokens ),
            type = StatisticsTypes.get ( contentText, textEditor );

      return { type, ranges: [range] };

    });

  }

}

/* EXPORT */

export default Project;
