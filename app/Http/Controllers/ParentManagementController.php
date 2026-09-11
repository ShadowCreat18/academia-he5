<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ParentManagementController extends Controller
{
    /**
     * Display a listing of the parents.
     */
    public function index()
    {
        $parents = User::where('role', 'parent')
            ->with(['players' => function($q) {
                $q->select('players.id', 'first_name', 'last_name', 'category', 'secondary_category');
            }])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Parents/Index', [
            'parents' => $parents
        ]);
    }

    /**
     * Update the specified parent in storage.
     */
    public function update(Request $request, User $parent)
    {
        if ($parent->role !== 'parent') {
            abort(403, 'Solo se pueden editar usuarios con rol de padre.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($parent->id)],
            'phone' => 'nullable|string|max:25',
            'password' => 'nullable|string|min:8',
        ]);

        $parent->name = $request->name;
        $parent->username = $request->username;
        $parent->phone = $request->phone;

        if ($request->filled('password')) {
            $parent->password = Hash::make($request->password);
        }

        $parent->save();

        return back()->with('success', 'Datos del tutor actualizados correctamente.');
    }

    /**
     * Remove the specified parent from storage.
     */
    public function destroy(User $parent)
    {
        if ($parent->role !== 'parent') {
            abort(403, 'Solo se pueden eliminar usuarios con rol de padre.');
        }
        
        // Prevent deletion if they have financial records to avoid constraint errors
        if ($parent->financialTransactions()->exists()) {
            return back()->with('error', 'No se puede eliminar a este tutor porque tiene registros financieros asociados.');
        }

        $parent->delete();

        return back()->with('success', 'Tutor eliminado correctamente.');
    }
}
