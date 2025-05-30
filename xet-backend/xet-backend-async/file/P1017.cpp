#include<iostream>
#include<cmath>
#include<vector>
using namespace std;
int main(){
	int r;
	int n;
	cin >> n >> r;
	vector<int> ans;
	cout << n <<"=";
	char num[21]={'0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K'};
	while(n!=0){
		ans.push_back((n%r+abs(r))%r);
//		cout << (n%r-r)%r;
//		cout << n<<endl;
		n=(n-(n%r+abs(r))%r)/r;
	}
	for(int i=ans.size()-1; i>=0; i--){
		cout << num[ans[i]];
	}
	cout << "(base"<<r<<")";
	return 0;
}
