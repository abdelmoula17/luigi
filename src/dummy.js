console.log('\n-------------------------------------------------------\n');
const token = {
  type: 'punc',
  value: '(',
};

function is_punc(char) {
  var current_token = token;
  return (
    current_token &&
    current_token.type === 'punc' &&
    (!char || current_token.value === char) &&
    current_token
  );
}

// function test_logic(char) {
//   return !char || char === '*';
// }
// console.log(is_punc());

console.log('\n-------------------------------------------------------\n');
