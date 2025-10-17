const FORBIDDEN_ELEMENTS = [
  {
    tag: 'button',
    suggestion: 'Use <md-filled-button>, <md-outlined-button>, or <md-text-button> instead.',
    messageId: 'nativeButton',
  },
  {
    tag: 'input',
    suggestion:
      'Use <md-outlined-text-field>, <md-filled-text-field>, <md-checkbox>, or another Material Web component instead.',
    messageId: 'nativeInput',
  },
  {
    tag: 'select',
    suggestion: 'Use <md-filled-select> or <md-outlined-select> with <md-select-option> instead.',
    messageId: 'nativeSelect',
  },
  {
    tag: 'textarea',
    suggestion: 'Use <md-filled-text-field type="textarea"> or <md-outlined-text-field> instead.',
    messageId: 'nativeTextarea',
  },
];

const DIRECTIVE_COMMENT = 'Add `// eslint-disable-next-line @df/md3/enforce-md3 -- reason` if a legitimate exemption is required.';

function buildRegExp(tag) {
  return new RegExp(`<\\s*${tag}\\b`, 'gi');
}

function detectInputSuggestion(sourceFragment) {
  const checkboxMatch = sourceFragment.match(/type\\s*=\\s*['\"]checkbox['\"]/i);
  if (checkboxMatch) {
    return 'Use <md-checkbox> instead of a native checkbox input.';
  }
  const radioMatch = sourceFragment.match(/type\\s*=\\s*['\"]radio['\"]/i);
  if (radioMatch) {
    return 'Use <md-radio> (Material Web radio) instead of a native radio input.';
  }
  const fileMatch = sourceFragment.match(/type\\s*=\\s*['\"]file['\"]/i);
  if (fileMatch) {
    return null;
  }
  return 'Use <md-outlined-text-field> or another Material Web component instead of a native <input>.';
}

export const enforceMD3Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow native form and interactive HTML elements inside Lit html tagged templates; enforce Material Design 3 components.',
      recommended: false,
    },
    messages: {
      nativeButton:
        'Native <button> detected. Use Material Design 3 buttons (<md-filled-button>, <md-outlined-button>, <md-text-button>). If Material Web does not provide this pattern, see guides/STANDARDS_STYLES.md#md3-gaps.',
      nativeInput:
        'Native <input> detected. {{suggestion}} If Material Web does not provide this pattern, see guides/STANDARDS_STYLES.md#md3-gaps.',
      nativeSelect:
        'Native <select> detected. Use Material Design 3 selects (<md-filled-select> or <md-outlined-select>). If Material Web does not provide this pattern, see guides/STANDARDS_STYLES.md#md3-gaps.',
      nativeTextarea:
        'Native <textarea> detected. Use Material Design 3 text fields (<md-filled-text-field type="textarea">). If Material Web does not provide this pattern, see guides/STANDARDS_STYLES.md#md3-gaps.',
    },
    schema: [],
    hasSuggestions: true,
  },
  create(context) {
    const filename = context.getFilename();
    if (filename && filename.includes('node_modules')) {
      return {};
    }

    const sourceCode = context.getSourceCode();

    function reportMatch(node, match, reportConfig) {
      const index = match.index ?? 0;
      const start = node.range[0] + index;
      const loc = sourceCode.getLocFromIndex(start);
      const beforeText = sourceCode.text.slice(Math.max(0, start - 200), start);
      if (
        /eslint-disable-next-line\s+@df\/md3\/enforce-md3/.test(beforeText) ||
        /md3-gap/.test(beforeText)
      ) {
        return;
      }

      context.report({
        node,
        messageId: reportConfig.messageId,
        data: reportConfig.data,
        loc: {
          start: loc,
          end: loc,
        },
        suggest: [
          {
            desc: `${reportConfig.suggestion} ${DIRECTIVE_COMMENT}`,
            fix(fixer) {
              return fixer.insertTextBeforeRange([start, start], '');
            },
          },
        ],
      });
    }

    return {
      TaggedTemplateExpression(node) {
        const {tag} = node;
        if (!tag) return;

        const tagName = tag.type === 'Identifier' ? tag.name : undefined;
        if (tagName !== 'html') {
          return;
        }

        const nodeText = sourceCode.getText(node);

        for (const element of FORBIDDEN_ELEMENTS) {
          const regex = buildRegExp(element.tag);
          let match;
          while ((match = regex.exec(nodeText)) !== null) {
            if (element.tag === 'input') {
              const fragment = nodeText.slice(match.index, match.index + 120);
              const suggestion = detectInputSuggestion(fragment);
              if (!suggestion) {
                continue;
              }
              reportMatch(node, match, {
                messageId: element.messageId,
                suggestion,
                data: {
                  suggestion,
                },
              });
            } else {
              reportMatch(node, match, {
                messageId: element.messageId,
                suggestion: element.suggestion,
                data: {
                  suggestion: element.suggestion,
                },
              });
            }
          }
        }
      },
    };
  },
};

export default enforceMD3Rule;
