
import { LoginTop } from './LoginTop';
import { LoginBottom } from './LoginBottom';

export const Login = () => {
       return (
        <div className="flex flex-col w-full min-h-screen justify-center items-center select-none bg-[#e8eae8]  gap-10">
            <LoginTop/>
            <LoginBottom/>
        </div>
    )
}